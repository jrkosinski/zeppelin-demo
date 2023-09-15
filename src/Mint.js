import React, { useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Wallet from "./components/Wallet";

function Mint() {
    const walletRef = useRef(null);

    const mintNft = async (productName, royaltyBps, price, quantity) => {
        await walletRef.current.mintNft(productName, royaltyBps, price, quantity);
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
        mintNft(
            formData.productName, 
            parseInt(formData.royaltyBps), 
            parseInt(formData.price), 
            parseInt(formData.quantity)
        );
    };

    return (
        <div className="App">
            <Wallet ref={walletRef} />
            <img src={logo} className="App-logo" alt="logo" style={{ height: '100px' }} />
            <p>
                <h2>Mint a Product NFT</h2>
            </p>
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
        </div>
    );
}

export default Mint;
