// Add imports here
const BIP39 = require('bip39')
const hdkey = require('ethereumjs-wallet/dist/hdkey')
const Wallet = require('ethereumjs-wallet')
// this is another hashing algorithm
const keccak256 = require('js-sha3').keccak256
// for signing transactions in the browser
const EthereumTx = require('ethereumjs-tx')

// Add functions here
// Function to generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
function generateMnemonic() {
  return BIP39.generateMnemonic()
}

var isValid = BIP39.validateMnemonic("Enter your mnemonic here")
// returns false. "Enter your mnemonic here" is not a valid phrase"

// use mnemonic as parameter to generate a seed from which to generate a private key
function generateSeed(mnemonic) {
  return BIP39.mnemonicToSeed(mnemonic)
}

// generate a private key from the hex seed
function generatePrivKey(mnemonic) {
  const seed = generateSeed(mnemonic)
  return hdkey.fromMasterSeed(seed).derivePath(`m/44'/60'/0'/0/0`).getWallet().getPrivateKey()
}

// generate the public key from the private key
function derivePubKey(privKey) {
  const wallet = Wallet.fromPrivateKey(privKey)
  return wallet.getPublicKey()
}

// derive Ethereium address from the Keypair
// taking the keccak-256 hash of the public key will return 32 bytes which has to be trimmed to the last 20 bytes(which equals 40 characters in hex) to get the address
function deriveEthAddress(pubKey) {
  const address = keccak256(pubKey) // this is the hash keccak256 of the public key
  // get the last 20 bytes
  return "0x" + address.substring(address.length - 40, address.length)
}

// creating digital signature with private key - sign transactions from this address and broadcast them to the network
function signTx(privKey, txData) {
  const tx = new EthereumTx(txData)
  tx.sign(privKey)
  return tx  
}

// method for recovering sender address from signed transaction
function getSignerAddress(signedTx) {
  return "0x" + signedTx.getSenderAddress().toString('hex')
}

/*

Do not edit code below this line.

*/

var mnemonicVue = new Vue({
    el:"#app",
    data: {  
        mnemonic: "",
        privKey: "",
        pubKey: "",
        ETHaddress: "",
        sampleTransaction: {
            nonce: '0x00',
            gasPrice: '0x09184e72a000', 
            gasLimit: '0x2710',
            to: '0x31c1c0fec59ceb9cbe6ec474c31c1dc5b66555b6', 
            value: '0x10', 
            data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
            chainId: 3
        },
        signedSample: {},
        recoveredAddress: ""
    },
    methods:{
        generateNew: function(){
            this.mnemonic = generateMnemonic()
        },
        signSampleTx: function(){
            this.signedSample = signTx(this.privKey, this.sampleTransaction)
            console.log("signed Sample", this.signedSample)
        }
    },
    watch: {
        mnemonic: function(val){
            this.privKey = generatePrivKey(val)
        },
        privKey: function(val){
            this.pubKey = derivePubKey(val)
        },
        pubKey: function(val){
            this.ETHaddress = deriveEthAddress(val)
            this.recoveredAddress = ""
        },
        signedSample: function(val){
            this.recoveredAddress = getSignerAddress(val)
        }
    }
})
