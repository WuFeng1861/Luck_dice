import EthWallet from "@/utils/ethersHelper.js";
import {ElMessage} from "element-plus";
import { ref } from 'vue';

const connectedWalletAddress = ref('');
let etherWallet = new EthWallet();
export const connectWalletBeforeAuth = async () => {
    const chainId = await window.ethereum.request({method: 'eth_chainId'});
    console.log('connectWallet', window.ethereum.chainId, chainId, `0x${EthWallet.BINANCE.chainId.toString(16)}`);
    if (chainId !== `0x${EthWallet.BINANCE.chainId.toString(16)}`) {
        return etherWallet.toSwitch(EthWallet.BINANCE.chainId, EthWallet.BINANCE);
    }
    let result = await etherWallet.initAnyChain();
    if(!result.status) {
        ElMessage.warning(result.message);
        return;
    }
    EthWallet.walletList = [etherWallet];
    connectedWalletAddress.value = EthWallet.walletList[0].userAddress.toLowerCase();
    window.ethereum.once('accountsChanged', async () => {
        console.log('accountsChanged');
        await connectWalletBeforeAuth();
    })
}

export const checkConnectWallet = async (address) => {
    if(!etherWallet.isAddress(address)) {
        ElMessage.warning('Invalid address');
        return false;
    }
    if(address.toLowerCase() !== etherWallet.userAddress.toLowerCase()) {
        ElMessage.warning('Please connect to the correct wallet');
        return false;
    }
    return true;
}

export const getBindAddressSignRes = async () => {
    if(EthWallet.walletList.length === 0) {
        ElMessage.warning('Please connect wallet first');
        return {
            status: false,
            message: 'Please connect wallet first'
        };
    }
    let signRes = await EthWallet.walletList[0].signMessage('bind Mercury Game Address');
    return {
        status: true,
        message: 'Sign success',
        data: signRes
    };
}

export const getConnectedWalletAddressRef = () => {
  return connectedWalletAddress;
}