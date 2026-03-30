import mongoose from "mongoose"


const DB_URI = process.env.MONGODB_URI!
if (!DB_URI) {
    throw new Error('DB URI not defined')
}

//cache connection across hot-reload only in dev
declare global {
    var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
}


const cached = global._mongoose ?? { conn: null, promise: null }

export async function connectDB() {
    if (cached.conn) return cached.conn

    if (!cached.promise) {
        cached.promise = mongoose.connect(`${DB_URI}`, {
            bufferCommands: false
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null
        throw err
    }
    return cached.conn
}