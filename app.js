const express = require('express')
const bodyparser = require('body-parser')
const mysql = require('mysql2')
var cors = require('cors')
const nodemailer = require('nodemailer')
const app = express()
const bcrypt = require('bcrypt')
const port = 3030
const jwt = require('jsonwebtoken')
app.use(cors())
app.enable({origin:"*"})
const db = mysql.createConnection({
  host: 'localhost',
  user: 'TANTRASOFT',
  password: '1234',
  database: 'company',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the My SQL database!');
});


app.use(bodyparser.json());

app.post('/auth', (req, res) => {
  const { employeeName, password } = req.body;

//   let email_auth = nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:'akshayparte556@gmail.com',
//         pass:'fcggoivnzlyimfzw',
//     }
// })
// console.log(process.env.EMAIL_PASSWORD)

const secretKey = 'thisismyfuckingsecretkey@ss';

  const squery = 'SELECT * FROM user WHERE employeename = ?';
    db.query(squery, [employeeName  ], (err, result) => {
    if (err) throw err;
    // let res =  console.log(bcrypt.compare())
    if (result.length > 0) {
      let user = result[0]
      bcrypt.compare(password, user.password, (compareError, isPasswordValid) => {
        if (compareError) {
          return res.status(500).json({ message: 'Error comparing passwords' });
        }
        
        if (!isPasswordValid) {
          return res.status(401).json({ message: 'Authentication failed' });
        }
      });
      const token = jwt.sign({ userId: user.employeeName}, secretKey, { expiresIn: '1h' });
      // res.json({ token });
      // console.log(token)
      
      return res.json({ message: 'Login successfull', user: result[0],token });
    //   let emailOptions = {
    //     from:'akshayparte556@gmail.com',
    //     to:`${result[0].email}`,

    //     subject:'Testing',
    //     text:'Mail from Chai '
    // }
//       email_auth.sendMail(emailOptions,(err,info)=>{
//         if(err){
//             console.log("error occured while sending mail" , err)
//         }else{
//             console.log('Email sent: ' + info.response);
//             console.log((info));
//         }
// })

      // console.log("hello")
    } else {
      res.json({ message: 'Invalid credentials' });
    }
  });
});

app.post('/create-user', (req, res) => {
  const { department, employeeName,email, password } = req.body;
  console.log(req.body)
  const myQuery = 'SELECT * FROM user WHERE employeeName = ?';
  bcrypt.genSalt(10,(saltError,salt)=>{
    if(saltError){
      console.log("Salt Error")
    }
    bcrypt.hash(password,salt,(hashError,hashedPassword)=>{
      if(hashError){
          console.log("Hashing password")
      }
      else{
        // console.log(hashedPassword)
        db.query(myQuery, [employeeName], (err, result) => {
          if (err) throw err;
      
          if (result.length > 0) {
            res.json({ message: 'Username already exists' });
            console.log('Username already exists')
          } else {
      
            const insertQuery =    'INSERT INTO user (department, employeeName,email, password) VALUES (?, ?, ?, ?)';
            db.query(insertQuery, [department, employeeName,email, hashedPassword, true], (err, result) => {
              if (err) throw err;
              res.json({ message: 'User registered successfully' });
            });
          }
        });
      }
    })
  })

});

app.get('/get-details', (req, res) => {
  const query = 'SELECT id, name, username FROM user';
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
