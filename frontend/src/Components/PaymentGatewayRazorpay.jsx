import React, { useEffect, useState } from "react";
import axios from 'axios';
import {Html5QrcodeScanner} from 'html5-qrcode';
const PaymentGatewayRazorpay = () => {
    const [scanResult,setScanResult]=useState(null);
    const [msg,setMsg]=useState('');
    useEffect(()=>{
        const scanner =  new Html5QrcodeScanner('reader',{
            qrbox:{
                width:250,
                height:250,
            },
            fps: 5,
        });
        scanner.render(success,error);
        function success(result){
            scanner.clear();
            setScanResult(result);
    
        }
        function error(erro){
            console.warn(erro)
        }
    },[]);
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
    async function handleAllow(result) {
        let posted = {email:result}
        let res = await axios.put("http://localhost:5000/registration-api/register", posted);
        console.log(result);
        setMsg(JSON.stringify(res.data));
    }
    
    const paymentHandler = async (event) => {
        const amount = 500.0;
        const currency = 'INR';
        const receiptId = '1235823';
        const { email } = user;
        const response = await fetch('http://localhost:5000/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                currency,
                receipt: receiptId,
            })
        });

        const order = await response.json();
        console.log("order", order);

        var option = {
            key:"",
            amount,
            currency,
            name:"GDSC VNRVJIET",
            description: "Test Transaction",
            order_id: order.id,
            handler: async (response) => {
                const body = {...response, email}

                const validateResponse = await fetch('http://localhost:5000/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                })
                const jsonResponse = await validateResponse.json();
                console.log('jsonResponse', jsonResponse);
            },
            prefill: {
                name: "Jakka Vignesh",
                email: "jakkavignesh2002@gmail.com",
                contact: "9502844394"
            },
            notes: {
                address: "Razorpay Corporate Office"
            },
            theme: {
                color: "#3399cc"
            }
        };
        var rzp1 = new window.Razorpay(option); // Note: Accessing Razorpay from the window object
        rzp1.on("payment.failed", (res) => {
            alert("Payment failed");
        });
        rzp1.open();
        event.preventDefault();
    };
    const [user, setUser] = useState({
        email:""
    });
    let name, value;
    const handleInputs = (e) => {
        name = e.target.name;
        value = e.target.value;
        setUser({...user, [name]:value})
    }
    // const validateEmail = (email) => {
    //     // Basic email format validation using regular expression
    //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return emailRegex.test(email);
    // }
   
    return (
        <>
            <div className="product">
                <h1>Razorpay Payment Gateway</h1>
                <button className="button" onClick={paymentHandler}>Pay Now</button>
                <input type="text" name = "email" className = 'username' placeholder="Enter Email" autoComplete='off' value = {user.email} onChange={handleInputs}/>
                <div className="">
                    <h1>QR Code Scanning in ReactJS</h1>
                    {
                        scanResult?<div><button onClick={() => handleAllow(scanResult)} type="submit">Check</button><p>{msg}</p></div>:<div id="reader"></div>
                    }
                </div>
            </div>
        </>
    );
};

export default PaymentGatewayRazorpay;