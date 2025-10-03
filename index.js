import express from "express"
import admin from "firebase-admin"
import dotenv from "dotenv"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, ".env") })

// Inicialización de Firebase DUAL
const firebaseCredentials = process.env.FIREBASE_CREDENTIALS
if (firebaseCredentials) {
    // Producción: Usar credenciales desde la variable de entorno
    const serviceAccount = JSON.parse(firebaseCredentials)
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    })
} else {
    // Desarrollo: Usar credenciales por defecto (GOOGLE_APPLICATION_CREDENTIALS)
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    })
}

const db = admin.firestore()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// --- Configuración de CORS con función dinámica ---
const allowedOrigins = [/^http:\/\/localhost:\d{4}$/, /^https:\/\/.*\.netlify\.app$/]
const corsOptions = {
    origin: (origin, callback) => {
        // --- DEBUGGING ---
        console.log("--------------------------")
        console.log("CORS check - Origin:", origin)
        // -----------------

        // Permitir peticiones sin 'origin' (como Postman o apps mobile)
        if (!origin) return callback(null, true)

        // Chequear si el 'origin' de la petición coincide con nuestros orígenes permitidos
        if (allowedOrigins.some((regex) => regex.test(origin))) {
            console.log("CORS check - RESULT: ✅ PERMITIDO")
            callback(null, true)
        } else {
            console.log("CORS check - RESULT: ❌ DENEGADO")
            callback(new Error(`No permitido por CORS. Origen: ${origin}`))
        }
    },
    credentials: true,
}
app.use(cors(corsOptions))
// ----------------------------------------------------

const verifyAdminToken = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No autorizado: Token no proporcionado." })
    }

    const idToken = authHeader.split("Bearer ")[1]

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken)
        if (decodedToken.admin) {
            req.user = decodedToken
            next()
        } else {
            res.status(403).json({ message: "Acceso denegado: No tienes permisos de administrador." })
        }
    } catch (error) {
        console.error("Error al verificar token:", error)
        res.status(401).json({ message: "No autorizado: Token inválido o expirado." })
    }
}

app.get("/", (req, res) => {
    res.send("Crisol-server está en línea.")
})

app.get("/products", async (req, res) => {
    try {
        const snapshot = await db.collection("productos").get()
        const products = []
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() })
        })
        res.status(200).json(products)
    } catch (error) {
        console.error("Error al obtener productos:", error)
        res.status(500).json({ message: "Error interno del servidor al obtener productos." })
    }
})

app.get("/categories", async (req, res) => {
    try {
        const snapshot = await db.collection("categorias").get()
        const categories = []
        snapshot.forEach((doc) => categories.push(doc.data().nombre))
        res.status(200).json(categories)
    } catch (error) {
        console.error("Error al obtener categorías:", error)
        res.status(500).json({ message: "Error interno del servidor al obtener categorías." })
    }
})

app.post("/products", verifyAdminToken, async (req, res) => {
    try {
        if (process.env.SIMULATION_MODE === "true" && req.user.superAdmin !== true) {
            return res.status(201).json({
                simulated: true,
                message: "Modo simulación: El producto se habría agregado con éxito.",
                data: req.body,
            })
        }
        const newProduct = req.body
        const docRef = await db.collection("productos").add(newProduct)
        res.status(201).json({ id: docRef.id, ...newProduct })
    } catch (error) {
        console.error("Error al agregar producto:", error)
        res.status(500).json({ message: "Error interno del servidor al agregar producto." })
    }
})

app.put("/products/:id", verifyAdminToken, async (req, res) => {
    try {
        if (process.env.SIMULATION_MODE === "true" && req.user.superAdmin !== true) {
            return res.status(200).json({
                simulated: true,
                message: `Modo simulación: El producto con ID ${req.params.id} se habría actualizado.`,
                data: req.body,
            })
        }
        const { id } = req.params
        const updatedProduct = req.body
        await db.collection("productos").doc(id).update(updatedProduct)
        res.status(200).json({ id, ...updatedProduct })
    } catch (error) {
        console.error("Error al actualizar producto:", error)
        res.status(500).json({ message: "Error interno del servidor al actualizar producto." })
    }
})

app.delete("/products/:id", verifyAdminToken, async (req, res) => {
    try {
        if (process.env.SIMULATION_MODE === "true" && req.user.superAdmin !== true) {
            return res.status(200).json({
                simulated: true,
                message: `Modo simulación: Producto con ID ${req.params.id} se habría eliminado.`,
            })
        }
        const { id } = req.params
        await db.collection("productos").doc(id).delete()
        res.status(200).json({ message: `Producto con ID ${id} eliminado.` })
    } catch (error) {
        console.error("Error al eliminar producto:", error)
        res.status(500).json({ message: "Error interno del servidor al eliminar producto." })
    }
})

app.post("/categories", verifyAdminToken, async (req, res) => {
    try {
        const { nombre } = req.body
        if (!nombre) {
            return res.status(400).json({ message: "El nombre de la categoría es obligatorio." })
        }
        const existingCategory = await db.collection("categorias").where("nombre", "==", nombre).get()
        if (!existingCategory.empty) {
            return res.status(409).json({ message: "La categoría ya existe." })
        }

        if (process.env.SIMULATION_MODE === "true" && req.user.superAdmin !== true) {
            return res.status(201).json({
                simulated: true,
                message: "Modo simulación: La categoría se habría agregado con éxito.",
                data: { nombre },
            })
        }

        const docRef = await db.collection("categorias").add({ nombre })
        res.status(201).json({ id: docRef.id, nombre })
    } catch (error) {
        console.error("Error al agregar categoría:", error)
        res.status(500).json({ message: "Error interno del servidor al agregar categoría." })
    }
})

app.delete("/categories/:name", verifyAdminToken, async (req, res) => {
    try {
        const { name } = req.params
        const q = db.collection("categorias").where("nombre", "==", name)
        const querySnapshot = await q.get()

        if (querySnapshot.empty) {
            return res.status(404).json({ message: `No se encontró la categoría "${name}" para eliminar.` })
        }

        if (process.env.SIMULATION_MODE === "true" && req.user.superAdmin !== true) {
            return res.status(200).json({
                simulated: true,
                message: `Modo simulación: Categoría "${name}" se habría eliminado.`,
            })
        }

        const batch = db.batch()
        querySnapshot.forEach((doc) => batch.delete(doc.ref))
        await batch.commit()

        res.status(200).json({ message: `Categoría "${name}" eliminada.` })
    } catch (error) {
        console.error("Error al eliminar categoría:", error)
        res.status(500).json({ message: "Error interno del servidor al eliminar categoría." })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
})
