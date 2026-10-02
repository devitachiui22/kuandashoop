require("dotenv").config();

const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

(async () => {
    const client = await pool.connect();

    try {

        console.log("========================================");
        console.log("Conectando ao banco...");
        console.log("========================================");

        const senhaAdmin = await bcrypt.hash("augusto123@admin", 10);
        const senhaPadrao = await bcrypt.hash("123456", 10);

        const usuarios = await client.query(`
            SELECT id, nome, email, tipo
            FROM usuarios
            ORDER BY id
        `);

        console.log(`Encontrados ${usuarios.rows.length} usuários.\n`);

        for (const usuario of usuarios.rows) {

            if (usuario.tipo === "admin") {

                await client.query(
                    `UPDATE usuarios
                     SET senha = $1
                     WHERE id = $2`,
                    [senhaAdmin, usuario.id]
                );

                console.log(`ADMIN atualizado -> ${usuario.email}`);

            } else {

                await client.query(
                    `UPDATE usuarios
                     SET senha = $1
                     WHERE id = $2`,
                    [senhaPadrao, usuario.id]
                );

                console.log(`Usuário atualizado -> ${usuario.email}`);
            }
        }

        console.log("\n========================================");
        console.log("TODAS AS SENHAS FORAM ATUALIZADAS!");
        console.log("========================================");
        console.log("Admin:");
        console.log("Senha: augusto123@admin");
        console.log();
        console.log("Demais usuários:");
        console.log("Senha: 123456");

    } catch (err) {

        console.error("Erro:");
        console.error(err);

    } finally {

        client.release();
        await pool.end();

    }

})();