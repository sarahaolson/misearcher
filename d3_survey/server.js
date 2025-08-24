const express = require('express'),
  app = express(),
  dir = 'public/',
  port = 3000,
  { MongoClient, ObjectId } = require('mongodb');

app.use(express.static('public'))
app.use(express.json())
//app.use(express.urlencoded({extended: true}))


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`;
const client = new MongoClient(uri)

let survey_data = null

async function run() {
  await client.connect()
  survey_data = await client.db("cs573_survey").collection("survey_results")
}

run()

app.use((req, res, next) => {
  if (survey_data !== null) {
    next()
  } else {
    res.status(503).send()
  }
})

app.get('/', (req,res) => {
  res.sendFile(__dirname+'/public/survey.html')
})


app.post('/register_pid', async (req,res) => {
  await survey_data.insertOne(req.body)
})


app.post('/submitEntry', async (req, res) => {
    if(survey_data !== null){
        const body = req.body

        const pid = body.pid
        const question_num = body.question_num
        let question_id = body.question_id
        let user_value = parseInt(body.user_value)
        let correct_value = body.correct_value

        const db_question_id = "question_id_" + question_num.toString()
        const db_user_value = "user_value_" + question_num.toString()
        const db_correct_value = "correct_value_" + question_num.toString()

        let current_data = await survey_data.find({pid: pid}).toArray()

        await survey_data.updateOne(
            { _id: current_data[0]._id },
            { $set: {[db_question_id]: question_id, [db_user_value]: user_value, [db_correct_value]: correct_value}}
        )
    }
})



app.listen(port)
