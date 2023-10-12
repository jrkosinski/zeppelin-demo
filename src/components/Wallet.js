import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ethers } from "ethers";
import abi from "../contracts/abi";
import addresses from "../contracts/addresses";
import { randomHex } from 'web3-utils';

const Wallet = forwardRef((props, ref) => {
    const [account, setAccount] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {

        connectWallet();
    }, []);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                await window.ethereum.request(
                    { method: 'eth_requestAccounts' }
                );

                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [
                        {
                            chainId: "0xaa36a7",
                        },
                    ],
                });

                setAccount(await signer.getAddress());
            } else {
                alert("Please install MetaMask.");
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    
    const requestSignMessage = async () => {
        console.log(connected);
        if (!connected) {
            if (window.ethereum && account) {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const message = randomHex(1);
                    const signature = await signer.signMessage(message);
                    console.log(signature);
                    setConnected(true);
                }
                catch (e) {
                    console.error(e);
                }
            }
        }
    };

    //BLOCKCHAIN WRITES
    const writeOperation = async (contractName, func, address = null) => {
        try {
            if (window.ethereum) {
                if (!account) 
                    await connectWallet(); 
                    
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                console.log('signer:', await signer.getAddress());
                
                if (!address) 
                    address = addresses[contractName]
                const contract = new ethers.Contract(address, abi[contractName], signer);

                if (contract) {
                    const tx = await func(contract);
                    console.log(tx);
                    return tx;
                }
            } else {
                console.error("No crypto wallet found");
            }
        }
        catch (e) {
            console.error(e);
        }
    }; 
    
    const createNft = async (productName, fieldNames, fieldValues) => {
        return await writeOperation("productNftIssuer", async (contract) => {
            console.log("createNft", productName, fieldNames, fieldValues); 
            return await contract.createNft(
                productName, "CVR",
                fieldNames, fieldValues
            );
        }); 
    };

    const attachNftPolicy = async (nftAddress, nftPolicy) => {
        return await writeOperation("productNftIssuer", async (contract) => {
            console.log("attachNftPolicy", nftAddress, nftPolicy);
            return await contract.attachNftPolicy(
                nftAddress, nftPolicy
            );
        });
    };

    const mintNfts = async (nftAddress, quantity, fieldNames, fieldValues) => {
        return await writeOperation("productNftIssuer", async (contract) => {
            console.log("mintNfts", nftAddress, quantity, fieldNames, fieldValues);
            return await contract.mintNfts(
                nftAddress, quantity, fieldNames, fieldValues
            );
        });
    };

    const postToStore = async (nftAddress, price) => {
        return await writeOperation("productNftIssuer", async (contract) => {
            console.log("postToStore", nftAddress, price);
            return await contract.postToStore(
                nftAddress, price
            );
        });
    };

    const postForSale = async (nftAddress, tokenId) => {
        return await writeOperation("productNft", async (contract) => {
            console.log("postForSale", nftAddress);

            return await contract.setApprovalForAll(
                addresses.productNftStore,
                true
            );
        }, nftAddress);
    };

    const removeFromStore = async (nftAddress, tokenId) => {
        return await writeOperation("productNft", async (contract) => {
            console.log("postForSale", nftAddress);

            return await contract.setApprovalForAll(
                addresses.productNftStore,
                false
            );
        }, nftAddress);
    };

    const purchaseNft = async (nftAddress, tokenId) => {
        return await writeOperation("productNftStore", async (contract) => {
            const price = (await contract.getPrice(nftAddress)).toString();
            console.log("purchaseNft", nftAddress, tokenId, price);

            return await contract.purchaseNft(
                nftAddress, tokenId, { value: price }
            );
        }); 
    };

    const collectRoyalties = async (nftAddress, tokenId) => {

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const nft = new ethers.Contract(nftAddress, abi.productNft, signer);
        console.log('owner of token:', await nft.ownerOf(tokenId));
        console.log('owner of nft:', await nft.owner()); 
        
        return await writeOperation("affiliatePayout", async (contract) => {
            console.log("buyerWithdraw", nftAddress, tokenId);

            return await contract.buyerWithdraw(
                nftAddress, tokenId
            );
        });
    };
    
    //READ-ONLY METHODS
    const getNftsOwned = async () => {
        if (window.ethereum) {
            if (!account)
                await connectWallet(); 
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.productNftStore, abi.productNftStore, signer);

            const userAddress = await signer.getAddress();
            const nftAddresses = await contract.getNftsForSale();
            const nfts = [];

            for (let n = 0; n < nftAddresses.length; n++) {
                const nftAddr = nftAddresses[n];
                const nft = new ethers.Contract(nftAddr, abi.productNft, signer);
                
                const nftInfo = await Promise.all([
                    nft.balanceOf(userAddress),
                    nft.name(), 
                    nft.royaltyBps(),
                    nft.isApprovedForAll(await nft.owner(), addresses.productNftStore), 
                    nft.totalMinted()
                ]);
                
                const item = {
                    address: nftAddr,
                    numberOwned: nftInfo[0], 
                    name: nftInfo[1],
                    productId: nftInfo[1],
                    royalty: nftInfo[2],
                    isForSale: nftInfo[3],
                    totalQuantity: nftInfo[4],
                    instances: []
                }; 
                
                const ownerInfoPromises = [];
                for (let i = 0; i < item.totalQuantity; i++) {
                    const tokenId = i + 1;
                    ownerInfoPromises.push(nft.ownerOf(tokenId));
                }
                
                const ownerInfo = await Promise.all(ownerInfoPromises);
                
                for (let i = 0; i < item.totalQuantity; i++) {
                    const tokenId = i + 1;
                    if (ownerInfo[i] === userAddress) {
                        item.instances.push({
                            affiliateId: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(nftAddr + tokenId.toString())).substring(0, 20),
                            tokenId: tokenId
                        });
                    }
                }
                nfts.push(item);
            }

            return nfts;
        } else {
            console.error("No crypto wallet found");
        }
    }; 
    
    const getNftsForSale = async () => {
        if (window.ethereum) {
            if (!account)
                await connectWallet(); 
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();
            const contract = new ethers.Contract(addresses.productNftStore, abi.productNftStore, signer);

            const nftAddresses = (await contract.getNftsForSale());
            const nfts = [];

            for (let n = 0; n < nftAddresses.length; n++) {
                const nftAddr = nftAddresses[n];
                const nft = new ethers.Contract(nftAddr, abi.productNft, signer);
                
                const nftInfo = await Promise.all([
                    nft.owner(),
                    contract.getPrice(nftAddr), 
                    nft.totalMinted(), 
                    nft.name(),
                    nft.isApprovedForAll(await nft.owner(), addresses.productNftStore),
                    nft.royaltyBps()
                ]); 
                const nftOwner = nftInfo[0];
                
                const item = {
                    address: nftAddr,
                    price: nftInfo[1], 
                    instances: [],
                    name: nftInfo[3],
                    productId: nftInfo[3],
                    isForSale: nftInfo[4],
                    royalty: nftInfo[5]
                }; 
                const count = nftInfo[2]; 
                
                const nftOwnersPromises = [];
                for (let i = 0; i < count; i++) {
                    const tokenId = i + 1;
                    nftOwnersPromises.push(nft.ownerOf(tokenId))
                }
                
                const nftOwners = await Promise.all(nftOwnersPromises);
                
                for (let i=0; i<count; i++) {
                    const tokenId = i+1;
                    if (nftOwners[i] === nftOwner && nftOwners[i] !== userAddress) {
                        item.instances.push({
                            affiliateId: ethers.utils.keccak256(ethers.utils.toUtf8Bytes(nftAddr + tokenId.toString())).substring(0, 20),
                            tokenId: tokenId
                        }); 
                    }
                }
                
                nfts.push(item);
            }

            return nfts;
        } else {
            console.error("No crypto wallet found");
        }
    }; 
    
    const getAmountsOwed = async () => {
        const nftsOwned = await getNftsOwned(); 

        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.affiliatePayout, abi.affiliatePayout, signer);

            const owedPromises = [];
            let index = 0;
            for (let n = 0; n < nftsOwned.length; n++) {
                for (let i = 0; i < nftsOwned[n].instances.length; i++) {
                    const token = nftsOwned[n].instances[i];
                    owedPromises.push(contract.getAmountOwed(nftsOwned[n].address, token.tokenId));
                }
            }
            
            const amountsOwed = await Promise.all(owedPromises);
            
            index = 0;
            for (let n=0; n<nftsOwned.length; n++) {
                for (let i=0; i<nftsOwned[n].instances.length; i++) {
                    const token = nftsOwned[n].instances[i];
                    token.amountOwed = await amountsOwed[index++];
                }
            }
        } else {
            console.error("No crypto wallet found");
        }

        return nftsOwned;
    }; 

    useImperativeHandle(ref, () => ({
        createNft, 
        attachNftPolicy,
        mintNfts, 
        postToStore,
        purchaseNft, 
        collectRoyalties, 
        getNftsOwned, 
        getNftsForSale, 
        getAmountsOwed, 
        postForSale, 
        removeFromStore, 
        requestSignMessage
    }));

    return (
        <div></div>
    );
});

export default Wallet;