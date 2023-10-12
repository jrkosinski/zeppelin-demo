import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.png';
import './App.css';
import Wallet from "./components/Wallet";

function Sell() {
    const walletRef = useRef(null);
    const [nfts, setNfts] = useState(null);

    const getNfts = async () => {
        const nfts = await walletRef.current.getAmountsOwed();
        //console.log(nfts);
        setNfts(nfts);
    };

    useEffect(() => {
        getNfts();
    }, []);

    const createNft = async (productName, fieldNames, fieldValues) => {
        const tx = await walletRef.current.createNft(productName, fieldNames, fieldValues);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const attachNftPolicy = async (nftAddress, nftPolicy) => {
        const tx = await walletRef.current.attachNftPolicy(nftAddress, nftPolicy);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const mintNfts = async (nftAddress, quantity, fieldNames, fieldValues) => {
        const tx = await walletRef.current.mintNfts(nftAddress, quantity, fieldNames, fieldValues);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const postToStore = async (nftAddress, price) => {
        const tx = await walletRef.current.postToStore(nftAddress, price);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const postForSale = async (nftAddress) => {
        const tx = await walletRef.current.postForSale(nftAddress);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const removeFromStore = async (nftAddress) => {
        const tx = await walletRef.current.removeFromStore(nftAddress);

        if (tx) {
            const rc = await tx.wait();
            console.log('Transaction hash:', rc.transactionHash);
            await getNfts();
        }
    };

    const [formData, setFormData] = useState({
        productName: "",
        royaltyBps: 0,
        price: 0,
        quantity: 0,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form data submitted:", formData);
        createNft(
            formData.productName, [], []
        );
    };

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} alt="logo" style={{ height: '100px' }} />
            <h2>Mint a Product NFT</h2>
                
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 20 }}>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignContent: 'left', alignSelf: 'left', textAlign: 'left', }}>
                        <label>
                            product name  &nbsp;
                            <input
                                type="text"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                            />
                        </label>
                        <br />
                        <br />
                        <label>
                            royalty (BPS)  &nbsp;
                            <input
                                type="text"
                                name="royaltyBps"
                                value={formData.royaltyBps}
                                onChange={handleChange}
                            />
                        </label>
                        <br />
                        <br />
                        <label>
                            price (wei)  &nbsp;
                            <input 
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </label>
                        <br />
                        <br />
                        <label>
                            quantity (integer)  &nbsp;
                            <input
                                type="text"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                            />
                        </label>
                        <br />
                    </div>
                    <br /><br />
                    <div>
                        <button type="submit">Submit</button>
                    </div>
                </form>
            </div>
            <h2>My NFTs</h2>

            <div style={{ alignContent: 'left', alignSelf: 'left', textAlign: 'left', padding: 10 }}>
                <ul style={{ listStyleType: "none", paddingLeft: 15, paddingBottom: 14, alignContent: 'left' }}>
                    {!nfts && <div>be patient...</div>}
                    {nfts && nfts.map((nft, index) => (
                        <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #ddd" }}>
                            <b>{nft.name}</b><br />{nft.address} <b>({nft.numberOwned.toString()} owned by you)</b>&nbsp;&nbsp;
                            {nft.numberOwned > 0 && !nft.isForSale && <button onClick={() => postForSale(nft.address)}>sell in store</button>}
                            {nft.numberOwned > 0 && nft.isForSale && <button onClick={() => removeFromStore(nft.address)}>remove from store</button>}
                            <br /><br />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Sell;
