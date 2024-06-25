const {Web3} = require('web3');
const web3 = new Web3(`https://mainnet.infura.io/v3/f7d97b0dc2cc4cacbe0ce490110745b6`);

// Replace 'SENDER_ADDRESS' and 'RECEIVER_ADDRESS' with the actual Ethereum addresses
const senderAddress = '0x39ed68f2087dcA23F76792EcA8F39508E74d82e5';
const receiverAddress = '0x3B922e5252d4A89641092DD7E514FF21bfb07a00';
const amountToSend = web3.utils.toWei('10', 'ether'); // Amount to send in Wei (1 Ether in this example)

// Estimate gas cost for the transaction
web3.eth.estimateGas({
    from: senderAddress,
    to: receiverAddress,
    value: amountToSend,
})
    .then(async(gasEstimate) => {
        console.log(`Estimated gas cost: ${gasEstimate}`);

        // You can also get the current gas price (in Wei) using web3.eth.gasPrice
        let gasPrice = await web3.eth.getGasPrice();
        console.log(`Current gas price: ${gasPrice} Wei`);

        // Calculate the total transaction cost
        const totalCost = gasPrice * gasEstimate;
        console.log(`Total transaction cost: ${web3.utils.fromWei(totalCost)} Wei`);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
