import axios from '../axiosConfig'

export const apiGetCurrent = () => new Promise(async (resolve, reject) => {
    try {
        const response = await axios({
            method: 'get',
            url: '/api/v1/user/me',
        })
        resolve(response)

    } catch (error) {
        reject(error)
    }
})
export const apiUpdateProfile = (payload) => new Promise(async (resolve, reject) => {
    try {
        const response = await axios({
            method: 'put',
            url: '/api/v1/user/me',
            data: payload,
        })
        resolve(response)

    } catch (error) {
        reject(error)
    }
})
