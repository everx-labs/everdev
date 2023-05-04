/*
    Multisignature Wallet with setcode
    Copyright (C) 2022 Ever Surf

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
pragma ton-solidity >=0.66.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;
pragma AbiHeader time;

/// @title Multisignature wallet 2.0 with setcode.
/// @author Ever Surf
contract MultisigWallet {

    /*
     *  Storage
     */

    struct Transaction {
        // Transaction Id.
        uint64 id;
        // Transaction confirmations from custodians.
        uint32 confirmationsMask;
        // Number of required confirmations.
        uint8 signsRequired;
        // Number of confirmations already received.
        uint8 signsReceived;
        // Public key of custodian queued transaction.
        uint256 creator;
        // Index of custodian.
        uint8 index;
        // Recipient address.
        address dest;
        // Amount of nanoevers to transfer.
        uint128 value;
        // Flags for sending internal message (see SENDRAWMSG in TVM spec).
        uint16 sendFlags;
        // Payload used as body of outbound internal message.
        TvmCell payload;
        // Bounce flag for header of outbound internal message.
        bool bounce;
        // Smart contract image to deploy with internal message.
        optional(TvmCell) stateInit;
    }

    /// Request for code update
    struct UpdateRequest {
        // request id
        uint64 id;
        // index of custodian submitted request
        uint8 index;
        // number of confirmations from custodians
        uint8 signs;
        // confirmation binary mask
        uint32 confirmationsMask;
        // public key of custodian submitted request
        uint256 creator;
        // New wallet code hash or null if wallet code should not be changed.
        optional(uint256) codeHash;
        // New wallet custodians (pubkeys)
        optional(uint256[]) custodians;
        // New number of confirmations required to execute transaction
        optional(uint8) reqConfirms;
        // New unconfirmed transaction lifetime in seconds.
        optional(uint32) lifetime;
    }

    /*
     *  Constants
     */
    uint8   constant MAX_QUEUED_REQUESTS = 5;
    uint32  constant DEFAULT_LIFETIME = 3600; // lifetime is 1 hour
    uint32  constant MIN_LIFETIME = 10; // 10 secs
    uint8   constant MAX_CUSTODIAN_COUNT = 32;
    uint    constant MAX_CLEANUP_TXNS = 40;

    // Send flags.
    // Forward fees for message will be paid from contract balance.
    uint8 constant FLAG_PAY_FWD_FEE_FROM_BALANCE = 1;
    // Ignore errors in action phase to avoid errors if balance is less than sending value.
    uint8 constant FLAG_IGNORE_ERRORS = 2;
    // Send all remaining balance.
    uint8 constant FLAG_SEND_ALL_REMAINING = 128;

    /*
     * Variables
     */
    // Public key of custodian who deployed a contract.
    uint256 m_ownerKey;
    // Binary mask with custodian requests (max 32 custodians).
    uint256 m_requestsMask;
    // Dictionary of queued transactions waiting for confirmations.
    mapping(uint64 => Transaction) m_transactions;
    // Set of custodians, initiated in constructor, but they can be changed later.
    mapping(uint256 => uint8) m_custodians; // pub_key -> custodian_index
    // Read-only custodian count, initiated in constructor.
    uint8 m_custodianCount;
    // Set of update requests.
    mapping (uint64 => UpdateRequest) m_updateRequests;
    // Binary mask for storing update request counts from custodians.
    // Every custodian can submit only one request.
    uint32 m_updateRequestsMask;
    // Minimal number of confirmations required to upgrade wallet code.
    uint8 m_requiredVotes;
    // Minimal number of confirmations needed to execute transaction.
    uint8 m_defaultRequiredConfirmations;
    // Unconfirmed transaction lifetime, in seconds.
    uint32 m_lifetime;

    /*
    Exception codes:
    100 - message sender is not a custodian;
    102 - transaction does not exist;
    103 - operation is already confirmed by this custodian;
    107 - input value is too low;
    108 - wallet should have only one custodian;
    110 - Too many custodians;
    113 - Too many requests for one custodian;
    115 - update request does not exist;
    116 - update request already confirmed by this custodian;
    117 - invalid number of custodians;
    119 - stored code hash and calculated code hash are not equal;
    120 - update request is not confirmed;
    121 - payload size is too big;
    122 - object is expired;
    124 - new custodians are not defined; 
    125 - `code` argument should be null;
    126 - in case of internal deploy: only 1 custodian is allowed;
    127 - in case of internal deploy: custodian pubkey must be equal to tvm.pubkey;
    */

    /*
     * Constructor
     */

    /// @dev Internal function called from constructor to initialize custodians.
    function _initialize(
        optional(uint256[]) ownersOpt,
        uint8 reqConfirms,
        uint32 lifetime
    ) inline private {
        if (ownersOpt.hasValue()) {
            uint8 ownerCount = 0;
            uint256[] owners = ownersOpt.get();
            if (owners.length == 0) {
                owners.push(tvm.pubkey());
            }
            m_ownerKey = owners[0];
            uint256 len = owners.length;
            delete m_custodians;
            for (uint256 i = 0; (i < len && ownerCount < MAX_CUSTODIAN_COUNT); i++) {
                uint256 key = owners[i];
                if (!m_custodians.exists(key)) {
                    m_custodians[key] = ownerCount++;
                }
            }
            m_custodianCount = ownerCount;
        }

        m_defaultRequiredConfirmations = math.min(m_custodianCount, reqConfirms);

        m_requiredVotes = (m_custodianCount <= 2) ? m_custodianCount : ((m_custodianCount * 2 + 1) / 3);

        uint32 minLifetime = uint32(m_custodianCount) * MIN_LIFETIME;
        if (lifetime == 0) {
            m_lifetime = DEFAULT_LIFETIME;
        } else {
            m_lifetime = math.max(minLifetime, math.min(lifetime, uint32(now & 0xFFFFFFFF)));
        }
    }

    /// @dev Contract constructor.
    /// @param owners Array of custodian keys.
    /// @param reqConfirms Minimal number of confirmations required for executing transaction.
    /// @param lifetime Unconfirmed transaction lifetime, in seconds.
    constructor(uint256[] owners, uint8 reqConfirms, uint32 lifetime) public {
        require(owners.length > 0 && owners.length <= MAX_CUSTODIAN_COUNT, 117);
        // Allow to deploy from other smart contracts
        if (msg.sender.value == 0) {
            // external deploy
            require(msg.pubkey() == tvm.pubkey(), 100);
        } else {
            // internal deploy, 
            // check security condition
            require(owners.length == 1, 126);
            require(owners[0] == tvm.pubkey(), 127);
        }
        tvm.accept();
        _initialize(owners, reqConfirms, lifetime);
    }

    /*
     * Inline helper macros
     */

    /// @dev Returns queued transaction count by custodian with defined index.
    function _getMaskValue(uint256 mask, uint8 index) inline private pure returns (uint8) {
        return uint8((mask >> (8 * uint256(index))) & 0xFF);
    }

    /// @dev Increment queued transaction count by custodian with defined index.
    function _incMaskValue(uint256 mask, uint8 index) inline private pure returns (uint256) {
        return mask + (1 << (8 * uint256(index)));
    }

    /// @dev Decrement queued transaction count by custodian with defined index.
    function _decMaskValue(uint256 mask, uint8 index) inline private pure returns (uint256) {
        return mask - (1 << (8 * uint256(index)));
    }

    /// @dev Checks bit with defined index in the mask.
    function _checkBit(uint32 mask, uint8 index) inline private pure returns (bool) {
        return (mask & (uint32(1) << index)) != 0;
    }

    /// @dev Checks if object is confirmed by custodian.
    function _isConfirmed(uint32 mask, uint8 custodianIndex) inline private pure returns (bool) {
        return _checkBit(mask, custodianIndex);
    }

    function _isSubmitted(uint32 mask, uint8 custodianIndex) inline private pure returns (bool) {
        return _checkBit(mask, custodianIndex);
    }

    /// @dev Sets custodian confirmation bit in the mask.
    function _setConfirmed(uint32 mask, uint8 custodianIndex) inline private pure returns (uint32) {
        mask |= (uint32(1) << custodianIndex);
        return mask;
    }

    /// @dev Checks that custodian with supplied public key exists in custodian set.
    function _findCustodian(uint256 senderKey) inline private view returns (uint8) {
        optional(uint8) custodianIndex = m_custodians.fetch(senderKey);
        require(custodianIndex.hasValue(), 100);
        return custodianIndex.get();
    }

    /// @dev Generates new id for transaction.
    function _generateId() inline private pure returns (uint64) {
        return (uint64(now) << 32) | (tx.timestamp & 0xFFFFFFFF);
    }

    /// @dev Returns timestamp after which transactions are treated as expired.
    function _getExpirationBound() inline private view returns (uint64) {
        return (uint64(now) - uint64(m_lifetime)) << 32;
    }

    /// @dev Returns transfer flags according to input value and `allBalance` flag.
    function _getSendFlags(uint128 value, bool allBalance) inline private pure returns (uint8, uint128) {
        uint8 flags = FLAG_IGNORE_ERRORS | FLAG_PAY_FWD_FEE_FROM_BALANCE;
        if (allBalance) {
            flags = FLAG_IGNORE_ERRORS | FLAG_SEND_ALL_REMAINING;
            value = 0;
        }
        return (flags, value);
    }

    /*
     * Public functions
     */

    /// @dev Allows custodian if she is the only owner of multisig to transfer funds with minimal fees.
    /// @param dest Transfer target address.
    /// @param value Amount of funds to transfer.
    /// @param bounce Bounce flag. Set true to transfer funds to existing account,
    /// set false to create new account.
    /// @param flags `sendmsg` flags.
    /// @param payload Tree of cells used as body of outbound internal message.
    function sendTransaction(
        address dest,
        uint128 value,
        bool bounce,
        uint8 flags,
        TvmCell payload
    ) public view {
        require(m_custodianCount == 1, 108);
        require(msg.pubkey() == m_ownerKey, 100);
        tvm.accept();
        dest.transfer(value, bounce, flags | FLAG_IGNORE_ERRORS, payload);
    }

    /// @dev Allows custodians to submit new transaction.
    /// @param dest Transfer target address.
    /// @param value Nanoevers value to transfer.
    /// @param bounce Bounce flag. Set true if need to transfer evers to existing account; set false to create new account.
    /// @param allBalance Set true if need to transfer all remaining balance.
    /// @param payload Tree of cells used as body of outbound internal message.
    /// @param stateInit Smart contract image to deploy with internal message.
    /// @return transId Transaction ID.
    function submitTransaction(
        address dest,
        uint128 value,
        bool bounce,
        bool allBalance,
        TvmCell payload,
        optional(TvmCell) stateInit
    ) public returns (uint64 transId) {
        uint256 senderKey = msg.pubkey();
        uint8 index = _findCustodian(senderKey);
        _removeExpiredTransactions();
        require(_getMaskValue(m_requestsMask, index) < MAX_QUEUED_REQUESTS, 113);
        tvm.accept();

        (uint8 flags, uint128 realValue) = _getSendFlags(value, allBalance);

        m_requestsMask = _incMaskValue(m_requestsMask, index);
        uint64 trId = _generateId();
        Transaction txn = Transaction({
            id: trId,
            confirmationsMask: 0,
            signsRequired: m_defaultRequiredConfirmations,
            signsReceived: 0,
            creator: senderKey,
            index: index,
            dest: dest, 
            value: realValue,
            sendFlags: flags,
            payload: payload,
            bounce: bounce,
            stateInit: stateInit
        });

        _confirmTransaction(txn, index);
        return trId;
    }

    /// @dev Allows custodian to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint64 transactionId) public {
        uint8 index = _findCustodian(msg.pubkey());
        _removeExpiredTransactions();
        optional(Transaction) txnOpt = m_transactions.fetch(transactionId);
        require(txnOpt.hasValue(), 102);
        Transaction txn = txnOpt.get();
        require(!_isConfirmed(txn.confirmationsMask, index), 103);
        tvm.accept();
        _confirmTransaction(txn, index);
    }

    /*
     * Internal functions
     */

    /// @dev Confirms transaction by custodian with defined index.
    /// @param txn Transaction object to confirm.
    /// @param custodianIndex Ccustodian index which confirms transaction.
    function _confirmTransaction(
        Transaction txn,
        uint8 custodianIndex
    ) inline private {
        if ((txn.signsReceived + 1) >= txn.signsRequired) {
            if (txn.stateInit.hasValue()) {
                txn.dest.transfer({
                    value: txn.value,
                    bounce: txn.bounce,
                    flag: txn.sendFlags,
                    body: txn.payload,
                    stateInit: txn.stateInit.get()
                });
            } else {
                txn.dest.transfer({
                    value: txn.value,
                    bounce: txn.bounce,
                    flag: txn.sendFlags,
                    body: txn.payload
                });
            }
            m_requestsMask = _decMaskValue(m_requestsMask, txn.index);
            delete m_transactions[txn.id];
        } else {
            txn.confirmationsMask = _setConfirmed(txn.confirmationsMask, custodianIndex);
            txn.signsReceived++;
            m_transactions[txn.id] = txn;
        }
    }

    /// @dev Removes expired transactions from storage.
    function _removeExpiredTransactions() private {
        uint64 marker = _getExpirationBound();
        if (m_transactions.empty()) return;

        (uint64 trId, Transaction txn) = m_transactions.min().get();
        bool needCleanup = trId <= marker;
        
        if (needCleanup) {
            tvm.accept();
            uint i = 0;
            while (needCleanup && i < MAX_CLEANUP_TXNS) {
                i++;
                // transaction is expired, remove it
                m_requestsMask = _decMaskValue(m_requestsMask, txn.index);
                delete m_transactions[trId];
                optional(uint64, Transaction) nextTxn = m_transactions.next(trId);
                if (nextTxn.hasValue()) {
                    (trId, txn) = nextTxn.get();
                    needCleanup = trId <= marker;
                } else {
                    needCleanup = false;
                }
            }
            tvm.commit();
        }
    }

    /*
     * Get methods
     */
    
    /// @dev Helper get-method for checking if custodian confirmation bit is set.
    /// @return confirmed True if confirmation bit is set.
    function isConfirmed(uint32 mask, uint8 index) external pure returns (bool confirmed) {
        confirmed = _isConfirmed(mask, index);
    }

    /// @dev Get-method that returns wallet configuration parameters.
    /// @return maxQueuedTransactions The maximum number of unconfirmed transactions that a custodian can submit.
    /// @return maxCustodianCount The maximum allowed number of wallet custodians.
    /// @return expirationTime Transaction lifetime in seconds.
    /// @return minValue The minimum value allowed to transfer in one transaction.
    /// @return requiredTxnConfirms The minimum number of confirmations required to execute transaction.
    /// @return requiredUpdConfirms The minimum number of confirmations required to update wallet code.
    function getParameters() external view
        returns (uint8 maxQueuedTransactions,
                uint8 maxCustodianCount,
                uint64 expirationTime,
                uint128 minValue,
                uint8 requiredTxnConfirms,
                uint8 requiredUpdConfirms) {

        maxQueuedTransactions = MAX_QUEUED_REQUESTS;
        maxCustodianCount = MAX_CUSTODIAN_COUNT;
        expirationTime = m_lifetime;
        minValue = 0;
        requiredTxnConfirms = m_defaultRequiredConfirmations;
        requiredUpdConfirms = m_requiredVotes;
    }

    /// @dev Get-method that returns transaction info by id.
    /// @return trans Transaction structure.
    /// Throws exception if transaction does not exist.
    function getTransaction(uint64 transactionId) external view
        returns (Transaction trans) {
        optional(Transaction) txnOpt = m_transactions.fetch(transactionId);
        require(txnOpt.hasValue(), 102);
        trans = txnOpt.get();
    }

    /// @dev Get-method that returns array of pending transactions.
    /// Returns not expired transactions only.
    /// @return transactions Array of queued transactions.
    function getTransactions() external view returns (Transaction[] transactions) {
        uint64 bound = _getExpirationBound();
        for ((uint64 id, Transaction txn): m_transactions) {
            // returns only not expired transactions
            if (id > bound) {
                transactions.push(txn);
            }
        }
    }

    /// @dev Helper structure to return information about custodian.
    /// Used in getCustodians().
    struct CustodianInfo {
        uint8 index;
        uint256 pubkey;
    }

    /// @dev Get-method that returns info about wallet custodians.
    /// @return custodians Array of custodians.
    function getCustodians() external view returns (CustodianInfo[] custodians) {
        for ((uint256 key, uint8 index): m_custodians) {
            custodians.push(CustodianInfo(index, key));
        }
    }    

    /*
        SETCODE public functions
     */
    
    /// @dev Allows to submit update request. New custodians can be supplied.
    /// @param codeHash New wallet code hash.
    /// @param owners New wallet custodians (array of pubkeys).
    /// @param reqConfirms New number of confirmations required for executing transaction.
    /// @param lifetime New unconfirmed transaction lifetime, in seconds.
    /// @return updateId Id of submitted update request.
    function submitUpdate(
        optional(uint256) codeHash,
        optional(uint256[]) owners,
        optional(uint8) reqConfirms,
        optional(uint32) lifetime
    ) public returns (uint64 updateId) {
        uint256 sender = msg.pubkey();
        uint8 index = _findCustodian(sender);
        if (owners.hasValue()) {
            uint newOwnerCount = owners.get().length;
            require(newOwnerCount > 0 && newOwnerCount <= MAX_CUSTODIAN_COUNT, 117);
        }
        _removeExpiredUpdateRequests();
        require(!_isSubmitted(m_updateRequestsMask, index), 113);
        tvm.accept();
        
        if (codeHash.hasValue()) {
            if (codeHash.get() == tvm.hash(tvm.code())) {
                codeHash.reset();
            }
        }
        m_updateRequestsMask = _setConfirmed(m_updateRequestsMask, index);
        updateId = _generateId();
        m_updateRequests[updateId] = UpdateRequest({
            id: updateId,
            index: index,
            signs: 0,
            confirmationsMask: 0,
            creator: sender,
            codeHash: codeHash,
            custodians: owners, 
            reqConfirms: reqConfirms, 
            lifetime: lifetime
        });
        _confirmUpdate(updateId, index);
    }

    /// @dev Allow to confirm submitted update request. Call executeUpdate to do `setcode`
    /// after necessary confirmation count.
    /// @param updateId Id of submitted update request.
    function confirmUpdate(uint64 updateId) public {
        uint8 index = _findCustodian(msg.pubkey());
        _removeExpiredUpdateRequests();
        optional(UpdateRequest) requestOpt = m_updateRequests.fetch(updateId);
        require(requestOpt.hasValue(), 115);
        require(!_isConfirmed(requestOpt.get().confirmationsMask, index), 116);
        tvm.accept();

        _confirmUpdate(updateId, index);
    }

    /// @dev Allows to execute confirmed update request.
    /// @param updateId Id of update request.
    /// @param code Root cell of tree of cells with contract code.
    function executeUpdate(uint64 updateId, optional(TvmCell) code) public {
        require(m_custodians.exists(msg.pubkey()), 100);
        _removeExpiredUpdateRequests();
        optional(UpdateRequest) requestOpt = m_updateRequests.fetch(updateId);
        require(requestOpt.hasValue(), 115);
        UpdateRequest request = requestOpt.get();
        if (request.codeHash.hasValue()) {
            require(code.hasValue(), 119);
            require(tvm.hash(code.get()) == request.codeHash.get(), 119);
        } else {
            require(!code.hasValue(), 125);
        }
        require(request.signs >= m_requiredVotes, 120);
        
        tvm.accept();

        _deleteUpdateRequest(updateId, request.index);

        tvm.commit();
        if (request.codeHash.hasValue()) {
            TvmCell newcode = code.get();
            tvm.setcode(newcode);
            tvm.setCurrentCode(newcode);
        }
        
        TvmBuilder data;
        if (request.custodians.hasValue()) {
            data.store(true, request.custodians.get());
        } else {
            data.store(false, m_custodians, m_custodianCount, m_ownerKey);
        }
        if (request.reqConfirms.hasValue()) {
            data.store(request.reqConfirms.get());
        } else {
            data.store(m_defaultRequiredConfirmations);
        }
        if (request.lifetime.hasValue()) {
            data.store(request.lifetime.get());
        } else {
            data.store(m_lifetime);
        }
        onCodeUpgrade(data.toCell());
    }

    /// @dev Get-method to query all pending update requests.
    function getUpdateRequests() external view returns (UpdateRequest[] updates) {
        uint64 bound = _getExpirationBound();
        for ((uint64 updateId, UpdateRequest req): m_updateRequests) {
            if (updateId > bound) {
                updates.push(req);
            }
        }
    }

    /// @dev Old handler after code update. For compatibility with old msig.
    function onCodeUpgrade(uint256[] newOwners, uint8 reqConfirms) private functionID(2) {
        tvm.resetStorage();
        _initialize(newOwners, reqConfirms, 0);
    }

    /// @dev Handler after code update.
    function onCodeUpgrade(TvmCell data) private functionID(3) {
        tvm.resetStorage();
        optional(uint256[]) owners;
        TvmSlice slice = data.toSlice();
        bool ownersAsArray = slice.decode(bool);
        if (ownersAsArray) {
            owners = slice.decode(uint256[]);
        } else {
            (m_custodians, m_custodianCount, m_ownerKey) = slice.decode(
                mapping(uint256 => uint8), uint8, uint256);
        }

        (uint8 reqConfirms, uint32 lifetime) = slice.decode(uint8, uint32);
        _initialize(owners, reqConfirms, lifetime);
    }
    
    /*
     * Internal functions
     */

    /// @dev Internal function for update confirmation.
    function _confirmUpdate(uint64 updateId, uint8 custodianIndex) inline private {
        UpdateRequest request = m_updateRequests[updateId];
        request.signs++;
        request.confirmationsMask = _setConfirmed(request.confirmationsMask, custodianIndex);
        m_updateRequests[updateId] = request;
    }

    /// @dev Removes expired update requests.
    function _removeExpiredUpdateRequests() inline private {
        uint64 marker = _getExpirationBound();
        if (m_updateRequests.empty()) return;

        (uint64 updateId, UpdateRequest req) = m_updateRequests.min().get();
        bool needCleanup = updateId <= marker;
        if (needCleanup) {
            tvm.accept();
            while (needCleanup) {
                // request is expired, remove it
                _deleteUpdateRequest(updateId, req.index);
                optional(uint64, UpdateRequest) reqOpt = m_updateRequests.next(updateId);
                if (reqOpt.hasValue()) {
                    (updateId, req) = reqOpt.get();
                    needCleanup = updateId <= marker;
                } else {
                    needCleanup = false;
                }
            }
            tvm.commit();
        }
    }

    /// @dev Helper function to correctly delete request.
    function _deleteUpdateRequest(uint64 updateId, uint8 index) inline private {
        m_updateRequestsMask &= ~(uint32(1) << index);
        delete m_updateRequests[updateId];
    }
}
