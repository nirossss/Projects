const inputEvaluation = (inputs, type) => {
    if (type === 'register') {
        const { first_name, last_name, email, password } = inputs;

        if (!email.trim() || !password.trim() || !first_name.trim() || !last_name.trim()) {
            return { success: false, msg: 'Missing fields' }
        }
        if (checkSpaces(email) || checkSpaces(password) || checkSpaces(first_name) || checkSpaces(last_name)) {
            return { success: false, msg: 'White spaces used befor or after input.' }
        }
        if (!email.includes('@') || !email.includes('.')) {
            return { success: false, msg: 'Incorrect email syntax.' }
        }
    }

    if (type === 'login') {
        const { email, password } = inputs;

        if (!email.trim() || !password.trim()) {
            return { success: false, msg: 'Missing fields' }
        }
        if (checkSpaces(email) || checkSpaces(password)) {
            return { success: false, msg: 'White spaces used befor or after input.' }
        }
        if (!email.includes('@') || !email.includes('.')) {
            return { success: false, msg: 'Incorrect email syntax.' }
        }
    }

    return { success: true, msg: `Correct ${type} inputs` }
}

const checkSpaces = (str) => {
    if (str.length > str.trim().length) {
        return true
    }
    return false
}

module.exports = { inputEvaluation }