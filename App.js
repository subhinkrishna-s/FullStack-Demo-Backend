const Express = require('express')
const Mongoose = require('mongoose')
const Cors = require('cors')
const bodyParser = require('body-parser')
const Session = require('express-session')
const MongoDbSession = require('connect-mongodb-session')(Session)


const app = Express()
const store = new MongoDbSession({
    uri: 'mongodb+srv://subhinkrishna:Intelligent%40369@clustersks.oyjlntc.mongodb.net/?retryWrites=true&w=majority&appName=Clustersks',
    collectionName: 'sessions'
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// app.set('trust proxy', 1)
app.use(Cors({
    origin: 'http://localhost:3000',
    credentials: true
}))

app.use(Session({
    secret: 'sk-key',
    resave: false,
    saveUninitialized: false,
    store: store,
}))

Mongoose.connect("mongodb+srv://subhinkrishna:Intelligent%40369@clustersks.oyjlntc.mongodb.net/?retryWrites=true&w=majority&appName=Clustersks").then(()=>console.log('Mongodb Connected successfully!')).catch((e)=>console.log('Error found on mongodb connection: ',e))

// Schema for Users
const UserSchema = Mongoose.Schema({
    fullname: {type: String, required: true},
    city: {type: String, required: true},    
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isAdmin: {type: Boolean, default: false}
})

// Model for Users
const Users = Mongoose.model('SKAPP_Users', UserSchema)

app.listen(4000, ()=>{
    console.log('Backend running on port 4000')
})


app.post('/signup', async (req, res) => {
    try{
        const User = req.body.user

        const findUser = await Users.findOne({email: User.email})
        if(findUser){
            return res.send({success: false, message: 'User Exists with this Email, please try login!'})
        }

        const data = new Users({
            fullname: User.fullname,
            city: User.city,
            email: User.email,
            password: User.password
        })


        const dataSave = await data.save()
        if(dataSave){
            req.session.user={
                fullname: dataSave.fullname,
                city: dataSave.city,
                email: dataSave.email,
                password: dataSave.password,
                isAdmin: dataSave.isAdmin
            }
            return res.send({success: true, message: 'User created Succesfully, Redirecting to Home page!'})
        }else{
            return res.send({success: false, message: 'Failed to create User, please contact developer!'})
        }
    }
    catch(err){
        console.log('Error in creating User: ',err)
        return res.send({success: false, message: 'Error occured in creating a User in Server, please contact developer!'})
    }
})

app.post('/signin', async(req, res)=>{
    try{
        const {email, password} = req.body
        const User = await Users.findOne({email: email})
        if(User){
            if(User.password===password){
                req.session.user={
                    fullname: User.fullname,
                    city: User.city,
                    email: User.email,
                    password: User.password,
                    isAdmin: User.isAdmin
                }
                return res.send({ success: true, message: 'Logged in successfully, you will be redirected now!' })
            }
            else{
                return res.send({success: false, message: 'Please enter the correct Password!'})
            }
        }
        else{
            return res.send({success: false, message: 'No users found, please check the email!'})
        }
    }
    catch(err){
        console.log('Error in Sign in : ',err)
        return res.send({success: false, message: 'Trouble in Sign in, please contact developer!'})
    }
})

app.post('/authcheck', async(req, res)=>{
    try{

        


        if(req.session.user){
            const UsersData = await Users.findOne({email: req.session.user.email})
            if(UsersData){
                return res.send({success: true, message: `${req.session.user.fullname} is Logged in!`, User: UsersData})
            }
            else{
                return res.send({success: false, message: 'No Users found!'})
            }
            
        }
        else{
            return res.send({success: false, message: "User isn't logged in!"})
        }
    }
    catch(err){
        console.log('Error in checking User Session: ',err)
        return res.send({success: false, message: "Trouble in checking User session, please contact developer!"})
    }
})

app.post('/signout', async(req, res)=>{
    try{
        req.session.destroy()
        return res.send({success: true, message: 'Signed out successfully!'})
    }
    catch(err){
        console.log('Error in Signing out: ',err)
        return res.send({success: false, message: 'Signed out Failed!'})
    }
})



app.post('/fetch-users', async(req, res)=>{
    if(req.session.user.isAdmin){
        try{
            const UsersData = await Users.find({})
            if(UsersData){
                return res.send({success: true, Users: UsersData})
            }
            else{
                return res.send({success: false, message: 'No Users found!'})
            }
        }
        catch(err){
            console.log('Error in fetching Users: ',err)
            return res.send({success: false, message: 'Trouble in fetching Users, Contact Developer!'})
        }
    }
})