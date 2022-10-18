const { MongoTransferer, MongoDBDuplexConnector, LocalFileSystemDuplexConnector } = require("mongodb-snapshot");
const dateFormat = require("dateformat");
const fs = require('fs');
const Q = require("q");

async function restoreLocalfile2Mongo(fileName) {
    var def = Q.defer();

    const mongo_connector = new MongoDBDuplexConnector({
        connection: {
            uri: `mongodb://localhost`,
            dbname: `${process.env.DB_NAME}`,
        },
    });

    const collections = await mongo_connector.listCollections().toArray();
    console.log(collections);
    // collections
    //   .map((collection) => collection.name)
    //   .forEach(async (collectionName) => {
    //     mongo_connector.dropCollection(collectionName);
    //   });

    var path = `./backups/${fileName}`

    const localfile_connector = new LocalFileSystemDuplexConnector({
        connection: {
            path: path,
        },
    });

    const transferer = new MongoTransferer({
        source: localfile_connector,
        targets: [mongo_connector],
    });

    for await (const { total, write } of transferer) {
        console.log(`remaining bytes to write: ${total - write}`);
    }
    def.resolve(1)
    return def.promise;
}

async function dumpMongo2Localfile(formData) {
    var def = Q.defer();
    var timestamp = Date.now();
    timestamp = dateFormat(timestamp, "yyyy-mm-dd_HH:MM");
    var path;
    if(formData.backupName == "")
        path = `/www/typer-cup.pl/backups/backup_${timestamp}.tar`
    else
        path = `/www/typer-cup.pl/backups/${formData.backupName}.tar`

    console.log(path)
    const mongo_connector = new MongoDBDuplexConnector({
        connection: {
            uri: `mongodb://localhost`,
            dbname: `${process.env.DB_NAME}`,
        },
    });

    const localfile_connector = new LocalFileSystemDuplexConnector({
        connection: {
            path: path,
        },
    });

    const transferer = new MongoTransferer({
        source: mongo_connector,
        targets: [localfile_connector],
    });

    for await (const { total, write } of transferer) {
        console.log(`remaining bytes to write: ${total - write}`);
    }
    def.resolve(1)
    return def.promise;
}

function getBackupsList(){
    var def = Q.defer();
    //const directoryPath = '/media/data/Projekty/ligatypera/dbBackup';

    const directoryPath = '/www/typer-cup.pl/backups';
    //passsing directoryPath and callback function
    fs.readdir(directoryPath, function (err, files) {
        //handling error
        if (err) {
            def.reject(err)
        }else{ 
            var filesList =[]
            files.forEach(function (file) {
                filesList.push(file)
            });
            def.resolve(filesList)
        }
    });
    return def.promise;

}

module.exports = {
    restoreLocalfile2Mongo,
    getBackupsList,
    dumpMongo2Localfile
}