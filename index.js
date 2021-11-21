const express = require('express')
const cors = require('cors')
const app = express()
const router = require('./routes/index')

const port = process.env.PORT || 7070

app.use(express.json())
app.use(cors())
app.use('/api/v1', router)

app.get("/", (req,res)=>{
    res.json({
        message:"server running",
        serverTime: new Date()
    })
})

app.get('*', (req,res) => {
    res.status(404).send('not found')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})