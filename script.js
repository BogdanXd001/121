document.addEventListener("DOMContentLoaded", async function () {
    const contractAddress = '0x7d64b39aac0De506eebc70eD7a90c7Ef9Cb7046a';
    const contractABI = [
        { "inputs": [{ "internalType": "address", "name": "_tokenAddress", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
        { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "FundsWithdrawn", "type": "event" },
        { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amountPaid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "tokensReceived", "type": "uint256" }], "name": "TokensPurchased", "type": "event" },
        { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "UnsoldTokensWithdrawn", "type": "event" },
        { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "acceptedTokens", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
        { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "buyTokens", "outputs": [], "stateMutability": "payable", "type": "function" },
        { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
        { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "bool", "name": "status", "type": "bool" }], "name": "setAcceptedToken", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [], "name": "tokenAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "tokenRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "tokensAllocated", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "tokensSold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
        { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [], "name": "withdrawUnsoldTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ];
    const paymentTokenAddresses = {
        bnb: '0x0', // Native token
        usdt: '0x55d398326f99059fF775485246999027B3197955', // USDT
        eth: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8' // ETH
    };

    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is not installed. Please install it to use this feature.");
        return;
    }

    const web3 = new Web3(window.ethereum);
    const presaleContract = new web3.eth.Contract(contractABI, contractAddress);

    // Debugging: Log contract methods
    console.log('Available contract methods:', presaleContract.methods);

    document.getElementById('connect-wallet').addEventListener('click', async function () {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                alert('Wallet connected successfully!');
                document.getElementById('buy-tokens').style.display = 'block';
            } else {
                alert('No wallet accounts found.');
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('Failed to connect wallet.');
        }
    });

    document.getElementById('buy-tokens').addEventListener('click', async function () {
        const paymentToken = document.getElementById('currency').value;
        const usdAmount = document.getElementById('usdt-amount').value;

        if (!usdAmount || usdAmount <= 0) {
            alert('Enter a valid amount.');
            return;
        }

        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (!accounts.length) {
                alert('Please connect your wallet first.');
                return;
            }

            const userAddress = accounts[0];
            const paymentTokenAddress = paymentToken === 'bnb' ? '0x0' : paymentTokenAddresses[paymentToken];
            const weiAmount = web3.utils.toWei(usdAmount, 'ether');

            // Debugging: Log payment details
            console.log('Payment Token Address:', paymentTokenAddress);
            console.log('Wei Amount:', weiAmount);

            const tx = await presaleContract.methods
                .buyTokens(paymentTokenAddress, weiAmount)
                .send({
                    from: userAddress,
                    value: paymentToken === 'bnb' ? weiAmount : 0
                });

            alert('Tokens purchased successfully!');
            console.log('Transaction details:', tx);
        } catch (error) {
            console.error('Transaction failed:', error);
            alert(`Failed to purchase tokens: ${error.message}`);
        }
    });

    // Update token amount dynamically
    document.getElementById('usdt-amount').addEventListener('input', async function () {
        const usdAmount = this.value;
        if (!usdAmount || usdAmount <= 0) {
            document.getElementById('token-amount').value = '';
            return;
        }

        try {
            const tokenRate = await presaleContract.methods.tokenRate().call();
            const tokenAmount = web3.utils.toBN(web3.utils.toWei(usdAmount, 'ether')).mul(web3.utils.toBN(tokenRate));
            document.getElementById('token-amount').value = web3.utils.fromWei(tokenAmount, 'ether');
        } catch (error) {
            console.error('Error fetching token rate:', error);
        }
    });
});
