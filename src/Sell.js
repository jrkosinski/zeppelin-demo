import React, { useState, useEffect, useRef, createRef } from 'react';
import logo from './logo.png';
import './App.css';
import Wallet from "./components/Wallet";
import AttachPolicies from './components/AttachPolicies';
import CreateNft from './components/CreateNft';
import MintNfts from './components/MintNfts';
import PostForSale from './components/PostForSale';
import { clear } from '@testing-library/user-event/dist/clear';

//0x9C570f23490b1A2df85AEFc9B1280f52aFbf487d

function Sell() {
    const walletRef = useRef(null);
    const createFormRef = useRef(null);
    const policyFormRef = useRef(null);
    const mintFormRef = useRef(null);
    const postFormRef = useRef(null);
    
    const [nfts, setNfts] = useState(null);
    const [nftAddress, setNftAddress] = useState(null);
    const [minted, setMinted] = useState(false);
    const [posted, setPosted] = useState(false);
    const [policiesAttached, setPoliciesAttached] = useState(false);

    const getNfts = async () => {
        const nfts = await walletRef.current.getAmountsOwed();
        //console.log(nfts);
        setNfts(nfts);
    };

    useEffect(() => {
        getNfts();
    }, []);

    const onNftCreated = (nftAddr) => {
        setNftAddress(nftAddr);
        getNfts();
    }

    const onPoliciesAttached = (done) => {
        setPoliciesAttached(done);
        getNfts();
    }
    
    const onNftsMinted = () => {
        setMinted(true);
        getNfts();
    }
    
    const onPosted = () => {
        setPosted(false);
        setMinted(false);
        setPoliciesAttached(false);
        clear();
        getNfts();
    }

    const postForSale = async () => {
        const tx = await walletRef.current.postForSale(nftAddress);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };
    
    const removeFromSale = async (nftAddress) => {
        const tx = await walletRef.current.removeFromStore(nftAddress);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} alt="logo" style={{ height: '100px' }} />
            <h2>Create a Product NFT</h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
                {!nftAddress &&
                    <CreateNft onNftCreated={onNftCreated} ref={createFormRef}></CreateNft>
                }

                {nftAddress && !policiesAttached &&
                    <AttachPolicies nftAddress={nftAddress} onPoliciesAttached={onPoliciesAttached} ref={policyFormRef} ></AttachPolicies>
                }

                {nftAddress && policiesAttached && !minted &&
                    <MintNfts nftAddress={nftAddress} onNftsMinted={onNftsMinted} ref={mintFormRef}></MintNfts>
                }

                {nftAddress && policiesAttached && minted && 
                    <PostForSale nftAddress={nftAddress} onPosted={onPosted} ref={postFormRef}></PostForSale>
                }
            </div>
            <h2>My NFTs</h2>

            <div style={{ alignContent: 'left', alignSelf: 'left', textAlign: 'left', padding: 10 }}>
                <ul style={{ listStyleType: "none", paddingLeft: 15, paddingBottom: 14, alignContent: 'left' }}>
                    {!nfts && <div>be patient...</div>}
                    {nfts && nfts.map((nft, index) => (
                        <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                            <b>{nft.name}</b><br />{nft.address} <b>({nft.numberOwned.toString()} owned by you)</b>&nbsp;&nbsp;
                            {nft.numberOwned > 0 && !nft.isForSale && <button onClick={() => postForSale(nft.address)}>sell in store</button>}
                            {nft.numberOwned > 0 && nft.isForSale && <button onClick={() => removeFromSale(nft.address)}>remove from store</button>}
                            <br /><br />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sell;
