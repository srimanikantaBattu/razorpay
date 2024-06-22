const express = require("express")
const Razorpay = require("razorpay")
const cors = require("cors")
const crypto = require("crypto")
const nodemailer = require('nodemailer');
const { from } = require("form-data");
const bodyParser = require('body-parser');
const QRCode = require('qrcode');
const mongoClient=require('mongodb').MongoClient;
require("dotenv").config()

mongoClient.connect(process.env.DB_URL)
.then(
    client=>{
    // get the database object
    const gdscdb=client.db('gdscdb');
    // get the collection object
    const scannercollection=gdscdb.collection('scannercollection');
    // provide the collection object to the express app
    app.set('scannercollection',scannercollection)
    // confirm db connection
    console.log("DB Connection successfull");
    })
.catch(err=>console.log("Error in the database connection",err));

const registrationApp=require('./APIS/registration-api');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended:false }));
app.use(cors());
app.use(bodyParser.json({ limit: '10mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use('/registration-api',registrationApp);



const sendEmail = async (email, orderId, paymentId) => {
    const qrCode = await QRCode.toDataURL(email);
    qrCodeImage=new Buffer.from(qrCode.split("base64,")[1], "base64")
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: "b15productpricetracker@gmail.com",
              pass: "nucvokqwzbgmkogp",
            },
        });
        const mailOptions = {
            from: {
                name: "B15 Product Pricetracker",
                address: "b15productpricetracker@gmail.com"
            },
            to: `${email}`,
            subject: "Order Confirmation",
            attachDataUrls:true,
            html: `
                <h1>Order Confirmation</h1>
                <img src="${qrCode}" alt="QR Code" />
                <p>Order ID: ${orderId}</p>
                <p>Payment ID: ${paymentId}</p>
                <p>Thank you for your order!</p>
                <p>Best regards</p>
            `
        }
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    }
    catch (err) {
        console.error('Error sending email:', error);
    }
}

app.post("/order", async(req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_SECRET
        })
        if(!req.body) {
            return res.status(400).send("Bad Request");
        }
        const options = req.body;
        // const email = req.body.email;
        console.log(options);
        const order = await razorpay.orders.create(options);
        if(!order) {
            return res.status(400).send("Bad Request");
        }
        res.json(order);
    }
    catch (err){
        console.log(err);
        res.status(500).send(err)
    }
})

app.post("/validate", async (req, res) => {

    const {razorpay_order_id, razorpay_payment_id, razorpay_signature, email} = req.body

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);

    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

    const digest = sha.digest("hex");

    if (digest!== razorpay_signature) {
        return res.status(400).json({msg: " Transaction is not legit!"});
    }
    await sendEmail(email, razorpay_order_id, razorpay_payment_id);
    res.json({msg: " Transaction is legit!", orderId: razorpay_order_id,paymentId: razorpay_payment_id});
})

app.listen(process.env.PORT, () => {
    console.log("listening on port " + process.env.PORT);
})