import { faker } from "@faker-js/faker"
import { MongoClient } from "mongodb"
import { config } from "dotenv"
config()
const MONGO_URI = process.env.MONGO_URI
const DB_NAME = process.env.DB_NAME
const COLLECTION_NAME = process.env.COLLECTION_NAME
if (!MONGO_URI) throw new Error("URIがセットされていません")
if (!DB_NAME) throw new Error("DB_NAMEがセットされていません")
if (!COLLECTION_NAME) throw new Error("TABLE_NAMEがセットされていません")

type Task = {
  title: string
  howManyHours: number
}
type Meal = {
  morning: string
  afternoon: string
  evening: string
}

type Diary = {
  date: Date
  title: string
  completedTasks: Task[]
  meal: Meal
}

function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i
  }
}

function createDiary(modification?: Partial<Diary>): Diary {
  const title = faker.address.county()
  const ranNum = Math.floor(Math.random() * 10 + 1)
  const completedTasks: Task[] = [...range(0, ranNum)].map(() => ({
    title: faker.music.songName(),
    howManyHours: Math.floor(Math.random() * 10 + 3),
  }))
  const date = faker.date.between(
    "2020-01-01T00:00:00.000Z",
    "2030-01-01T00:00:00.000Z"
  )
  const meal: Meal = {
    morning: faker.animal.type(),
    afternoon: faker.animal.type(),
    evening: faker.animal.type(),
  }

  const returnedVal: Diary = {
    title,
    completedTasks,
    date,
    meal,
    ...modification,
  }
  return returnedVal
}

const run = async () => {
  const client = new MongoClient(MONGO_URI)
  try {
    const database = client.db(DB_NAME)
    const collection = database.collection(COLLECTION_NAME)

    const queries = [...range(0, 3000)].map((query) => createDiary())

    const result = await collection.insertMany(queries)

    return result
  } catch (e) {
    console.error(e)
  }
}

run().then((result) => console.dir({ result }, { depth: null }))
