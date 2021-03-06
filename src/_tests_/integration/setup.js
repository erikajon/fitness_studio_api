import mongoose from 'mongoose'

const config = {
  db: {
    test: 'mongodb://localhost/test',
  },
  connection: null
}

const connect = async () => {
	return new Promise((resolve, reject) => {
    if (config.connection) {
      return resolve()
    }

    mongoose.Promise = Promise

    const options = {
      useMongoClient: true
    }

    try {
		  mongoose.connect(config.db.test, options)
		} catch (err) {
      try {
        mongoose.createConnection(config.db.test, options)
      } catch (err) {
        console.log('createConnection err', err)
      }
		}

    config.connection = mongoose.connection

    config.connection
      .once('open', resolve)
      .on('error', (e) => {
        if (e.message.code === 'ETIMEDOUT') {
          console.log(e)

          mongoose.connect(config.db.test, options)
        }

        console.log(e)
        reject(e)
      })
  })
}

const clearDatabase = async () => {
	return new Promise(resolve => {
    let cont = 0
    let max = Object.keys(mongoose.connection.collections).length
    for (const i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {
        cont++;
        if(cont >= max) {
          resolve()
        }
      })
    }

    if (!max) {
    	resolve()
    }
  })
}

export async function setupTest() {
  await connect()
  await clearDatabase()
}
