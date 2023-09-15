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

    const mintNft = async (productName, royaltyBps, price, quantity) => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.productNftFactory, abi.productNftFactory, signer);

            if (contract) {
                const result = await contract.issueMintAndPost(
                    productName, "CVR",
                    royaltyBps, price, quantity, [], []
                );
                return result;
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
            console.log(addresses.productNft);
            console.log(tokenId);
            console.log(price);
            
            if (contract) {
                const tx = await contract.purchaseNft(
                    nftAddress, tokenId, {value: price}
                );
                const receipt = await tx.wait();
                console.log('Transaction hash:', receipt.transactionHash);
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
                const result = await contract.pullPayment(
                    nftAddr, tokenId
                );
                return result;
            }
        } else {
            throw new Error("No crypto wallet found");
        }
    };
    
    const getNftsOwned = async () => {
        if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(addresses.productNftStore, abi.productNftStore, signer);

            const userAddress = await signer.getAddress();
            const nftAddresses = (await contract.getNftsForSale());
            const nfts = [];

            for (let n = 0; n < nftAddresses.length; n++) {
                const nftAddr = nftAddresses[n];
                const nft = new ethers.Contract(nftAddr, abi.productNft, signer);
                const count = await nft.balanceOf(userAddress);
                
                const item = {
                    address: nftAddr,
                    name: await nft.name(),
                    royalty: await nft.royaltyBps(),
                    quantity: count, 
                    instances: []
                }; 
                
                for (let i = 0; i < count; i++) {
                    const tokenId = i + 1;
                    if (await nft.ownerOf(tokenId) == userAddress) {
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
                const nftOwner = await nft.owner();
                
                const item = {
                    address: nftAddr,
                    price: await contract.getPrice(nftAddr)
                }; 
                const count = await nft.tokenQuantity(); 
                
                item.instances = [];
                item.productId = await nft.name();  
                
                for (let i=0; i<count; i++) {
                    const tokenId = i+1;
                    if (await nft.ownerOf(tokenId) == nftOwner) {
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

            for (let n=0; n<nftsOwned.length; n++) {
                for (let i=0; i<nftsOwned[n].instances.length; i++) {
                    const token = nftsOwned[n].instances[i];
                    token.amountOwed = await contract.amountOwed(nftsOwned[n].address, token.tokenId);
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