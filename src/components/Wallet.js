import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ethers } from "ethers";
import abi from "../contracts/abi";
import addresses from "../contracts/addresses";

const Wallet = forwardRef((props, ref) => {
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();

                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [
                        {
                            chainId: "0x61",
                        },
                    ],
                });

                setAccount(await signer.getAddress());
            } else {
                alert("Please install MetaMask.");
            }
        };

        connectWallet();
    }, []);

    //BLOCKCHAIN WRITES
    const mintNft = async (productName, royaltyBps, price, quantity) => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.productNftFactory, abi.productNftFactory, signer);

            if (contract) {
                const tx = await contract.issueMintAndPost(
                    productName, "CVR",
                    royaltyBps, price, quantity, [], []
                );
                return tx;
            }
        } else {
            throw new Error("No crypto wallet found");
        }
    };

    const purchaseNft = async (nftAddress, tokenId) => {
        
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(); 
            const contract = new ethers.Contract(addresses.productNftStore, abi.productNftStore, signer);

            const price = (await contract.getPrice(nftAddress)).toString();
            
            if (contract) {
                const tx = await contract.purchaseNft(
                    nftAddress, tokenId, {value: price}
                );
                return tx;
            }
        } else {
            throw new Error("No crypto wallet found");
        }
    };

    const collectRoyalties = async (nftAddr, tokenId) => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.affiliatePayout, abi.affiliatePayout, signer);

            if (contract) {
                const tx = await contract.pullPayment(
                    nftAddr, tokenId
                );
                return tx;
            }
        } else {
            throw new Error("No crypto wallet found");
        }
    };
    
    //READ-ONLY METHODS
    const getNftsOwned = async () => {
        if (window.ethereum) {
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
                    nft.royaltyBps()
                ]);
                const count = nftInfo[0];
                
                const item = {
                    address: nftAddr,
                    name: nftInfo[1],
                    royalty: nftInfo[2],
                    quantity: count, 
                    instances: []
                }; 
                
                const ownerInfoPromises = [];
                for (let i = 0; i < count; i++) {
                    const tokenId = i + 1;
                    ownerInfoPromises.push(nft.ownerOf(tokenId));
                }
                
                const ownerInfo = await Promise.all(ownerInfoPromises);
                
                for (let i = 0; i < count; i++) {
                    const tokenId = i + 1;
                    if (ownerInfo[i] == userAddress) {
                        item.instances.push({
                            tokenId: tokenId
                        });
                    }
                }
                nfts.push(item);
            }

            return nfts;
        } else {
            throw new Error("No crypto wallet found");
        }
    }; 
    
    const getNftsForSale = async () => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.productNftStore, abi.productNftStore, signer);

            const nftAddresses = (await contract.getNftsForSale());
            const nfts = [];

            for (let n = 0; n < nftAddresses.length; n++) {
                const nftAddr = nftAddresses[n];
                const nft = new ethers.Contract(nftAddr, abi.productNft, signer);
                
                const nftInfo = await Promise.all([
                    nft.owner(),
                    contract.getPrice(nftAddr), 
                    nft.tokenQuantity(), 
                    nft.name()
                ]); 
                const nftOwner = nftInfo[0];
                
                const item = {
                    address: nftAddr,
                    price: nftInfo[1]
                }; 
                const count = nftInfo[2]; 
                
                item.instances = [];
                item.productId = nftInfo[3];  
                
                const nftOwnersPromises = [];
                for (let i = 0; i < count; i++) {
                    const tokenId = i + 1;
                    nftOwnersPromises.push(nft.ownerOf(tokenId))
                }
                
                const nftOwners = await Promise.all(nftOwnersPromises);
                
                for (let i=0; i<count; i++) {
                    const tokenId = i+1;
                    if (nftOwners[i] == nftOwner) {
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
            throw new Error("No crypto wallet found");
        }
    }; 
    
    const getAmountsOwed = async() => {
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
                    owedPromises.push(contract.amountOwed(nftsOwned[n].address, token.tokenId));
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
            throw new Error("No crypto wallet found");
        }

        return nftsOwned;
    }; 

    useImperativeHandle(ref, () => ({
        mintNft, 
        purchaseNft, 
        collectRoyalties, 
        getNftsOwned, 
        getNftsForSale, 
        getAmountsOwed
    }));

    return (
        <div></div>
    );
});

export default Wallet;