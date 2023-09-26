export const homepage = async(req, res, next) => {
    try {
        res.send("welcome to careConnect homepage")
    } catch (err) {
        next(err)
    }
}