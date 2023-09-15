import React, { useState, useRef } from 'react'; 
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Mint from "./Mint";
import Buy from "./Buy";
import Collect from "./Collect";

function App() {
    return (
        <Router>
            <div className="App">
                <header>
                    <nav>
                        <Link to="/">home</Link> &nbsp;&#x2022; &nbsp;&nbsp;
                        <Link to="/mint">mint</Link> &nbsp; &#x2022; &nbsp;&nbsp;
                        <Link to="/buy">buy</Link> &nbsp; &#x2022; &nbsp;&nbsp;
                        <Link to="/collect">collect</Link>
                    </nav>
                </header>
            </div>
            
            <Routes>
                <Route path="/" element={<Mint/>} />
                <Route path="/mint" element={<Mint />} />
                <Route path="/buy" element={<Buy />} />
                <Route path="/collect" element={<Collect />} />
            </Routes>
        </Router>
    );
}

export default App;
