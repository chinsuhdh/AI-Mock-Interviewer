

const api = {
    post: async (endpoint, data) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (endpoint === '/Auth/register') {
                    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
                    const exists = users.find(u => u.username === data.username);
                    if (exists) {
                        return reject({ response: { data: 'Tên đăng nhập đã tồn tại!' } });
                    }
                    users.push({ ...data, id: Date.now() });
                    localStorage.setItem('mock_users', JSON.stringify(users));
                    resolve({ data: { message: 'Success' } });
                } 
                
                else if (endpoint === '/Auth/login') {
                    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
                    const user = users.find(u => u.username === data.username && u.password === data.password);
                    
                    if (user) {
                        resolve({ 
                            data: { 
                                token: `fake-jwt-token-${user.id}`, 
                                userId: user.id, 
                                fullName: user.fullName 
                            } 
                        });
                    } else {
                        reject({ response: { data: 'Sai tên đăng nhập hoặc mật khẩu!' } });
                    }
                }
            }, 800); 
        });
    }
};

export default api;