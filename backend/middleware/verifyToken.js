import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Brak tokenu." });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        const header = req.headers.authorization || "";
        const token = header.split(" ")[1];
        const partial = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString("utf8")
        );

        const stage = partial?.stage || "unknown";
        const msg =
          stage === "register_step1"
            ? "Token rejestracyjny wygasł. Zaloguj się, aby dokończyć rejestrację."
            : "Sesja wygasła. Zaloguj się ponownie.";

        return res.status(401).json({
          message: msg,
          expired: true,
          stage,
        });
      } catch {
        // jeśli nie uda się odczytać payloadu
        return res.status(401).json({
          message: "Token wygasł. Zaloguj się ponownie.",
          expired: true,
        });
      }
    }

    console.error("Błąd weryfikacji tokena:", err);
    return res.status(403).json({ message: "Nieprawidłowy token." });
  }
};
export const requireStageRegisterStep1 = (req, res, next) => {
  if (req.user?.stage !== "register_step1") {
    return res
      .status(403)
      .json({ message: "Wymagany token rejestracyjny (step1)" });
  }
  next();
};
export const requireStageCompleted = (req, res, next) => {
  if (req.user?.stage !== "completed") {
    return res.status(403).json({ message: "Wymagane pełne zalogowanie" });
  }
  next();
};
