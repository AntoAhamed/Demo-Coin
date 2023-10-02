const { Block, Transaction, Blockchain } = require("./index");

const EC = require('elliptic').ec;
var ec = new EC('secp256k1');

const key1 = ec.genKeyPair();
const privateKey1 = key1.getPrivate("hex");
const walletNumber1 = key1.getPublic("hex");

const key2 = ec.genKeyPair();
const privateKey2 = key2.getPrivate("hex");
const walletNumber2 = key2.getPublic("hex");

//First test of our coin
//Create a new coin
const democoin = new Blockchain();

//Create a new transaction
const tx1 = new Transaction(walletNumber1, walletNumber2, 100);
//Sign the transaction
tx1.signTransaction(key1);
//Add the transaction (transaction remains panding)
democoin.addTransaction(tx1);

//Mine the pending transaction
democoin.minePendingTransactions(walletNumber1);
console.log(democoin.getBalanceOfAddress(walletNumber1));
console.log(democoin.getBalanceOfAddress(walletNumber2));

//Create a new transaction
const tx2 = new Transaction(walletNumber2, walletNumber1, 50);
//Sign the transaction
tx2.signTransaction(key2);
//Add the transaction (transaction remains panding)
democoin.addTransaction(tx2);

democoin.minePendingTransactions(walletNumber1);
console.log(democoin.getBalanceOfAddress(walletNumber1));
console.log(democoin.getBalanceOfAddress(walletNumber2));

//Tamoering test
//democoin.chain[1].transactions[1] = "HACKED";

console.log(democoin.isBlockchainValid());
