# Endpoints

- ## Todos os dados do usuário
    - `tipo: GET`
    - `url:` /getData
    - `200 - resposta:`
        ```json
        {
            "turmas": [
                {
                    "id": int, 
                    "nome": string, 
                    "senha": string, 
                    "admin": int (0->False/1->True)
                },
                ...
            ],
            "materias": [
                {
                    "id": int, 
                    "nome": string, 
                    "professor": string, 
                    "contato": string,
                    "turmaID": int
                },
                ...
            ],
            "deveres": [
                {
                    "id": int, 
                    "nome": string, 
                    "pontos": string, 
                    "dataHora": int,
                    "idMateria": int,
                    "concluiu": int (0->False/1->True)
                },
                ...
            ],
        }
        ```

- ## Turmas do usuário
    - `tipo: GET`
    - `url:` /getTurmas
     - `200 - resposta:`
        ```json
        [
            {
                "id": int,
                "nome": string,
                "senha": string,
                "admin": int (0->False/1->True)
            },
            ...
        ]
        ```
    

- ## Entrar em nova Turma
    - `tipo: POST`
    - `url:` /enterTurma
    - `body:` 
        ```json
        {
            "turmaId": int
        }
        ```
     - `200 - resposta:` OK
        

- ## Criar nova turma
    - `tipo: POST`
    - `url:` /criarTurma
    - `body:` 
        ```json
        {
            "turmaId": int,
            "nome": string
        }
        ```
         - `200 - resposta:` OK

- ## Sair da turma
    - `tipo: DELETE`
    - `url:` /sairTurma
    - `body:` 
        ```json
        {
            "turmaId": int
        }
        ```
     - `200 - resposta:` OK

- ## Adicionar admin
    - `tipo: POST`
    - `url:` /addAdmin
    - `body:` 
        ```json
        {
            "turmaId": int,
            "userId": int
        }
        ```
     - `200 - resposta:` OK

- ## Participantes da turma
    - `tipo: POST`
    - `url:` /getParticipantes
    - `body:` 
        ```json
        {
            "turmas": list<int>
        }
        ```
     - `200 - resposta:`
        ```json
        [
            {
                "id": int,
                "nome": string,
                "admin": int (0->False/1->True)
            },
            ...
        ]
        ```

- ## Matérias da turma
    - `tipo: POST`
    - `url:` /getMaterias
    - `body:` 
        ```json
        {
            "turmaId": int
        }
        ```
        ou
        ```json
        {
            "turmas": list<int>
        }
        ```
     - `200 - resposta:`
        ```json
        [
            {
                "id": int,
                "nome": string,
                "contato": string,
                "professor": string,
                "turmaID": int
            },
            ...
        ]
        ```

- ## Adiciona Materia
    - `tipo: POST`
    - `url:` /materia
    - `body:` 
        ```json
        {
            "nome": string,
            "professor": string,
            "contato": string,
            "turmaId": int
        }
        ```
     - `200 - resposta:` OK

- # Apaga Materia
    - `tipo: DELETE`
    - `url:` /materia
    - `query:` 
        ```json
        "materiaId": int
        ```
     - `200 - resposta:` OK


- ## Editar Materia
    - `tipo: POST`
    - `url:` /editMateria
    - `body:` 
        ```json
        {
            "idMateria": int,
            "nome": string,
            "professor": string,
            "contato": string,
            "turmaId": int,
        }
        ```
     - `200 - resposta:` OK

- ## Deveres das turma
    - `tipo: POST`
    - `url:` /deveres
    - `body:` 
        ```json
        {
            "turmas": list<int>
        }
        ```
     - `200 - resposta:`
        ```json
        [
            {
                "id": int,
                "nome": string,
                "pontos": int,
                "dataHora": string,
                "idMateria": int
            },
            ...
        ]
        ```

- ## Criar dever
    - `tipo: POST`
    - `url:` /dever
    - `body:` 
        ```json
        {
            "nome": string,
            "pontos": int,
            "dataHora": string(ISO),
            "materiaId": int,
        }
        ```
     - `200 - resposta:` OK

- ## Apagar dever
    - `tipo: DELETE`
    - `url:` /dever
    - `query:` 
        ```json
        {
            "id": int
        }
        ```
     - `200 - resposta:` OK

- ## Status do dever
    - `tipo: PUT`
    - `url:` /statusDever
    - `body:` 
        ```json
        {
            "deverId": int,
            "status": bool
        }
        ```
     - `200 - resposta:`
        ```json
       {"mes": "OK"}
        ```

- ## Criar conta
    - `tipo: POST`
    - `url:` /createUser
    - `body:` 
        ```json
        {
            "email": string,
            "password": string,
            "name": string
        }
        ```
    - `200 - resposta:` `null`

- ## Fazer login
    - `tipo: POST`
    - `url:` /login
    - `body:` 
        ```json
        {
            "email": string,
            "password": string
        }
        ```
    - `200 - resposta:`
        ```json
        {
            "accessToken": Bearer 'token',
            "userId": int,
            "nome": string,
            "email": string
        }
        ```

# **Code 101**:
 Falta de um parâmatro necessário para a operação
# **Code 104**:
 Token inválido. == Logout now ==