// server/api/[username]/profile/upload.post.ts
import {defineEventHandler, readMultipartFormData, getRouterParams, setResponseStatus} from "h3";
import fs from "fs";
import path from "path";
import {v4 as uuidv4} from "uuid"; // Para gerar nomes de arquivo únicos
import sharp from "sharp";

async function processAndSaveImage(fileData, fileName, filePath) {
  try {
    await sharp(fileData).png().toFile(filePath);
    return true;
  } catch (error) {
    console.error("Erro ao processar a imagem:", error);
    return false;
  }
}

export default defineEventHandler(async (event) => {
   const { user } = await requireUserSession(event)
  try {
    const {username} = getRouterParams(event);
    const form = await readMultipartFormData(event);

    const baseUrl = getRequestURL(event).origin
    // const authToken = getCookie(event, "auth_token"); // Get the auth_token directly
    // const decoded = jwt.verify(authToken, "chave_secreta");
    // // const ret = await $fetch(`${baseUrl}/api/user`, {
    //   headers: event.headers // mantém o cookie para sessão
    // })

    if (!form || form.length === 0) {
      setResponseStatus(event, 400);
      return {success: false, message: "Nenhum arquivo enviado."};
    }

    const file = form.find((part) => part.name === "foto" && part.type.startsWith("image/"));

    if (!file) {
      setResponseStatus(event, 400);
      return {success: false, message: "Nenhuma imagem válida encontrada."};
    }

    // Gerar um nome de arquivo único
    const fileExtension = file.type.split("/")[1];
    const fileName = `avatar.png`;
    const filePath = path.join("server/uploads", user.domain, user.username, fileName); // Diretório onde salvar as fotos

    // Criar o diretório de uploads se não existir
    const uploadDir = path.join(process.cwd(), "server/uploads", user.domain, user.username)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, {recursive: true});
    }

     // Processar e salvar a imagem como PNG
     const imageProcessed = await processAndSaveImage(file.data, fileName, filePath);


    // Escrever o arquivo no sistema de arquivos
    // fs.writeFileSync(filePath, file.data);

    const imageUrl = `/${filePath}`; // URL relativa para acessar a foto

    // const fileData = fs.readFileSync(imageUrl); // Use req.file.buffer se estiver usando multer.memoryStorage
    // const imageProcessed = await processAndSaveImage(fileData, fileName, filePath);

    if (imageProcessed) {
      return {success: true, imageUrl, message: "Foto de perfil enviada com sucesso!"};

    } else {
      return {success: false,  message: "Erro de processamento"};

    }
    // Aqui, você pode salvar a imageUrl no banco de dados, se necessário
    // (Por exemplo, atualizar a tabela users com a nova URL da foto)
    // ... (Lógica para salvar a URL no banco de dados)

  } catch (error) {
    console.error("Erro ao processar upload:", error);
    setResponseStatus(event, 500);
    return {success: false, message: "Erro ao processar upload.", error: error.message};
  }
});
