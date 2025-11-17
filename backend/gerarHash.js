const bcrypt = require("bcryptjs")

const gerarHash = async () => {
    const senhaEmTextoPuro = "senha123";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(senhaEmTextoPuro, salt);
    console.log(hash);
};

gerarHash();