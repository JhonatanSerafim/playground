const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0NWFkYjA1Yy01M2ViLTQ0ZDctODkzNi0xMjlhYzc0OTcwYmUiLCJhdWQiOiJteWNsaWVudGlkIiwibmJmIjoxNzQ1OTQ1NzUyLCJpc3MiOiJodHRwOi8vMTAuMjUwLjAuMzo4NDAzL2F1dGh1c2VyIiwiZXhwIjoxNzQ1OTQ2MzUyLCJpYXQiOjE3NDU5NDU3NTIsImp0aSI6IjBkNGM4MDUyLWM4ODctNDA2MS05YWIzLWRmMzRmZjJmZjQxYSIsImVtYWlsIjoiYWRtaW5Aem91cGh5LmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iXSwidGVuYW50Ijoiem91cGh5Iiwic3RhdHVzIjoiQUNUSVZFIiwidXNlcm5hbWUiOiJhZG1pbkB6b3VwaHkuY29tIn0.KDmGS4Da0RP2CLtnZkesncM5xv-2N3wH41EtLaeepqM';

const TENANT_ID = 'zouphy';

const userData = {
    fullName: 'novo Serafim ',
    cpf: '92582382060',
    birthdate: '1990-01-01',
    email: 'nivdiasdsdfsd@mail.com',
    phoneNumber: '11999999999',
    cep: '12345678',
    address: 'Rua Exemplo',
    addressNumber: '123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    complement: 'Apto 101',
};

async function cadastrarUsuario() {
    const formData = new FormData();
    formData.append('fullName', userData.fullName);
    formData.append('cpf', userData.cpf);
    formData.append('birthdate', userData.birthdate);
    formData.append('email', userData.email);
    formData.append('cep', userData.cep);
    formData.append('address', userData.address);
    formData.append('addressNumber', userData.addressNumber);
    formData.append('neighborhood', userData.neighborhood);
    formData.append('city', userData.city);
    formData.append('state', userData.state);
    formData.append('complement', userData.complement);

    const headers = {
        'Authorization': `Bearer ${TOKEN}`,
        'x-tenant-id': TENANT_ID
    };

    console.log('Headers sendo enviados:', headers);

    const createResponse = await fetch('http://172.16.20.232:8402/authuser/auth/signup', {
        method: 'POST',
        headers: headers,
        body: formData
    });
    const data = await createResponse.json();
    console.log("DATA", data);
    const userId = data.id;
    alert(userId);

    const rolePayload = {
        userRole: 'ROLE_ADMIN'
    };

    const roleResponse = await fetch(`http://172.16.20.232:8402/authuser/auth/role/${userId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'x-tenant-id': TENANT_ID,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rolePayload)
    });
    if (!roleResponse.ok) {
        throw new Error('Usuário criado, mas houve um erro ao definir a permissão');
    }
    console.log('Usuário cadastrado com sucesso!');
}

async function buscarUsuarios() {
    const resultado = document.getElementById('resultadoUsuarios');
    resultado.textContent = 'Buscando...';
    try {
        const response = await fetch('http://172.16.20.232:8402/authuser/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'x-tenant-id': TENANT_ID
            }
        });
        const status = response.status;
        const text = await response.text();
        console.log('Status:', status);
        console.log('Resposta bruta:', text);
        if (!response.ok) {
            resultado.textContent = `Erro ao buscar usuários: Status ${status} - ${text}`;
            return;
        }
        if (!text) {
            resultado.textContent = 'Nenhum dado retornado pela API.';
            return;
        }
        const data = JSON.parse(text);
        const usuarios = (data.content || []).map(u => ({
            id: u.id,
            nome: u.fullName,
            cpf: u.cpf,
            email: u.email,
            roles: u.roles.map(r => r.authority),
            criadoEm: u.creationDate
        }));
        resultado.textContent = JSON.stringify(usuarios, null, 2);
    } catch (error) {
        resultado.textContent = 'Erro ao buscar usuários: ' + error;
    }
}

window.onload = buscarUsuarios;

function handleCadastrar() {
    cadastrarUsuario();
}
