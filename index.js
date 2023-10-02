//To generate hash
const sha256 = require("crypto-js/sha256");
const EC = require('elliptic').ec;
var ec = new EC('secp256k1');

//A block
class Block {
    constructor(timestamp, transactions, previousHash = "") {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    //Added difficulty to take time between transactions
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Mining done: " + this.hash);
    }

    //To calculate the current block hash
    calculateHash() {
        return sha256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce).toString();
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
}

//This is a transaction
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() {
        return sha256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(key) {
        if (key.getPublic("hex") !== this.fromAddress) {
            throw new Error("You do not have access.");
        }
        const hashTx = this.calculateHash();
        const signature = key.sign(hashTx, "base64");
        this.signature = signature.toDER();
    }

    isValid() {
        if (this.fromAddress === null) true;
        if (!this.signature || this.signature.length === 0) {
            throw new Error("No signature found.");
        }
        const key = ec.keyFromPublic(this.fromAddress, "hex");
        return key.verify(this.calculateHash(), this.signature);
    }
}

//The blockchain
class Blockchain {
    constructor() {
        this.chain = [this.generateGenesisBlock()];
        this.difficulty = 3;

        this.pendingTransactions = [];
        this.miningReward = 50;
    }

    //The initial block
    generateGenesisBlock() {
        return new Block("2023-01-01", "GENESIS", "0000");
    }

    //Function to get the last block of the chain
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    //To create transaction
    addTransaction(transaction) {
        //new logic after adding signature
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error("Can not process transaction.");
        }
        if (!transaction.isValid()) {
            throw new Error("Invalid transaction.");
        }

        if(transaction.amount < 0){
            throw new Error("Invalid transaction amount.");
        }

        /*if(transaction.amount > this.getBalanceOfAddress(transaction.fromAddress)){
            throw new Error("Not enough balance.");
        }*/

        this.pendingTransactions.push(transaction);
    }

    //To mine pending transactions
    minePendingTransactions(minerAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        this.chain.push(block);
        this.pendingTransactions = [
            //A miner will be rewarded with 10 coins after every successfull mining.
            //But miner will get the reward added to his amount after another transaction of mining.
            new Transaction(null, minerAddress, this.miningReward)
        ];
    }

    //Function to add a new block to the chain
    /*addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash(); This line added a block directly without mining...
        newBlock.mineBlock(this.difficulty); //This line will mine a new block...
        this.chain.push(newBlock);
    }*/

    //To check is the chain valid or not
    isBlockchainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            //new logic after adding signature...
            if (!currentBlock.hasValidTransactions()) {
                return false;
            }
        }
        return true;
    }

    //To get a address's balance
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
}

//till validation
//start with proof of work... (checkpoint 1)
//till transaction
//start with wallet... (checkpoint 2)

module.exports = { Block, Transaction, Blockchain };
