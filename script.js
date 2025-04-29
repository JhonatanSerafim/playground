const TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0NWFkYjA1Yy01M2ViLTQ0ZDctODkzNi0xMjlhYzc0OTcwYmUiLCJhdWQiOiJteWNsaWVudGlkIiwibmJmIjoxNzQ1OTQ3MTk3LCJpc3MiOiJodHRwOi8vMTAuMjUwLjAuMzo4NDAzL2F1dGh1c2VyIiwiZXhwIjoxNzQ1OTQ3Nzk3LCJpYXQiOjE3NDU5NDcxOTcsImp0aSI6ImE5ODBkM2E5LWEyNjItNDdkYS1iNDAwLTVlZTI5Y2E1NmMzYiIsImVtYWlsIjoiYWRtaW5Aem91cGh5LmNvbSIsImF1dGhvcml0aWVzIjpbIlJPTEVfQURNSU4iXSwidGVuYW50Ijoiem91cGh5Iiwic3RhdHVzIjoiQUNUSVZFIiwidXNlcm5hbWUiOiJhZG1pbkB6b3VwaHkuY29tIn0.pyZigdXGTKvwbl5CAf1jNi4eNEMTo1XL0PL9cabGE_w';

const TENANT_ID = 'zouphy';

const userData = {
    fullName: 'Jhonatan Serafim ',
    cpf: '36094751884',
    birthdate: '1990-02-04',
    email: 'jhonatan.serafim@acaruiy.com.br',
    phoneNumber: '1195596734',
    cep: '06246035',
    address: 'Rua Reinaldo Luiz Dogado',
    addressNumber: '544',
    neighborhood: 'Munhoz Júnior',
    city: 'Osasco',
    state: 'SP',
    complement: 'Casa 3',
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

// Função para deletar usuário
async function deletarUsuario(userId) {
    const response = await fetch(`http://172.16.20.232:8402/authuser/user/${userId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'x-tenant-id': TENANT_ID
        }
    });
    if (!response.ok) {
        throw new Error(`Erro ao deletar usuário: ${response.status}`);
    }
}       

window.onload = buscarUsuarios;

function handleCadastrar() {
    cadastrarUsuario();
}

async function handleDeletar() {
    const userId = document.getElementById('userId').value.trim();
    if (!userId) {
        alert('Por favor, insira o ID do usuário');
        return;
    }

    try {
        await deletarUsuario(userId);
        alert('Usuário deletado com sucesso!');
        // Limpa o campo de ID
        document.getElementById('userId').value = '';
        // Atualiza a lista de usuários
        await buscarUsuarios();
    } catch (error) {
        alert(error.message);
    }
}
