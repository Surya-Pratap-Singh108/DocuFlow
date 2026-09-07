import ImageKit,{toFile} from '@imagekit/nodejs';

const client=new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY,
});


export async function uploadFile({buffer,fileName,folder='DocuFlow'}) {
    const result=await client.files.upload({
    file: await toFile(buffer, fileName),
        fileName,
        folder,
    })
    return result;
}
