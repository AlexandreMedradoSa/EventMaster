const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabaseUrl = 'https://ougtqygdxiyexvjggryi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91Z3RxeWdkeGl5ZXh2amdncnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgzMzQ5OTgsImV4cCI6MjAzMzkxMDk5OH0.a5ukHaaPgKHHZ49ikFl085w4jnBD-q3_CyDyQbHaF9w';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Autenticacao
app.post('/register', async (req, res) => {
    console.log(req.body)
    const { nome, email, senha, role } = req.body;
    try {
        const response = await supabase.auth.signUp({ email, password: senha });
        if (response.error) throw new Error(response.error.message);
        const { user } = response.data;
        const { data, error: insertError } = await supabase
            .from('usuarios')
            .insert([{ nome, email, senha, id_supabase: user.id, role }]);

        if (insertError) throw new Error(insertError.message);

        res.status(201).json(data);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
});



app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { data: user, error: fetchError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .eq('senha', password)
            .single();

        if (fetchError) {
            throw new Error(fetchError.message);
        }

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



// Informaçoes do Usuario

app.get('/users', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('usuarios')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/user-info', async (req, res) => {
    try {
        const users = await supabase
            .from('usuarios')
            .select('*')
            .eq('id_supabase', req.body.id_supabase)
            .single();
        res.status(200).json(users.data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Perfil

app.put('/profile', async (req, res) => {
    const { name, email, password, id_supabase } = req.body;
    try {
       
        const { data: userData, error: fetchError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id_supabase', id_supabase)
            .single();

        const updates = {
            nome: name,
            email
        };

        if (password) {
            updates.senha = password;
        }

        const { data: updatedData, error: updateError } = await supabase
            .from('usuarios')
            .update(updates)
            .eq('id', userData.id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        res.status(200).json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});


// Admin

app.put('/update-role', async (req, res) => {
    const { email, newRole } = req.body;
    try {
        const { data, error } = await supabase
            .from('usuarios')
            .update({ role: newRole })
            .eq('email', email);

        if (error) {
            throw new Error(error.message);
        }

        res.status(200).json({ message: 'Nível de acesso atualizado com sucesso' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Eventos

app.get('/event-list/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { data: evento, error } = await supabase
            .from('eventos')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        res.status(200).json(evento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/event-list', async (req, res) => {
    try {
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select('*');
        if (error) {
            console.log(error)
            throw new Error(error.message);
        }
        res.status(200).json(eventos);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
});

app.post('/event-create', async (req, res) => {
    const { titulo, descricao, data_inicio, data_fim, localizacao, tipo_evento, criado_por } = req.body;
    try {
        const { data, error } = await supabase
            .from('eventos')
            .insert([{ titulo, descricao, data_inicio, data_fim, localizacao, tipo_evento, criado_por }]);
        if (error) {
            console.log(error)
            throw new Error(error.message);
        }
        res.status(201).json(data);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
});

app.put('/event-update/:id', async (req, res) => {
    const id = req.params.id;
    const { titulo, descricao, data_inicio, data_fim, localizacao, tipo_evento } = req.body;
    try {
        const { data, error } = await supabase
            .from('eventos')
            .update({ titulo, descricao, data_inicio, data_fim, localizacao, tipo_evento })
            .eq('id', id);
        if (error) {
            console.log(error)
            throw new Error(error.message);
        }
        res.status(200).json(data);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
});

app.delete('/event-delete/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const { data, error } = await supabase
            .from('eventos')
            .delete()
            .eq('id', id);
        if (error) {
            console.log(error)
            throw new Error(error.message);
        }
        res.status(200).json({ message: 'Evento excluído com sucesso' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: error.message });
    }
});

app.get('/event-list', async (req, res) => {
    try {
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select('*');
        if (error) {
            throw new Error(error.message);
        }
        res.status(200).json(eventos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/eventos-com-presenca', async (req, res) => {
    const { id_usuario } = req.body;
    try {
        const { data: frequencias, error: frequenciasError } = await supabase
            .from('frequencias')
            .select('id_evento')
            .eq('id_usuario', id_usuario)
            .eq('presente', true);

        if (frequenciasError) throw new Error(frequenciasError.message);

        const eventosIds = frequencias.map(frequencia => frequencia.id_evento);
        res.status(200).json(eventosIds);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/event-inscritos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: inscritos, error } = await supabase
            .from('inscricoes')
            .select('usuarios(nome, email)')
            .eq('id_evento', id);

        if (error) throw new Error(error.message);

        res.status(200).json(inscritos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Inscricoes


app.post('/inscrever', async (req, res) => {
    const { id_usuario, id_evento } = req.body;
    try {
        const { data, error } = await supabase
            .from('inscricoes')
            .insert([{ id_usuario, id_evento }]);
        if (error) {
            throw new Error(error.message);
        }
        res.status(201).json({ message: 'Inscrição realizada com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/minhas-inscricoes', async (req, res) => {
    const { id_usuario } = req.body;
    try {
        const { data: inscricoes, error } = await supabase
            .from('inscricoes')
            .select('*, eventos(*)')
            .eq('id_usuario', id_usuario);
        if (error) {
            throw new Error(error.message);
        }
        res.status(200).json(inscricoes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/cancelar-inscricao', async (req, res) => {
    const { id_usuario, id_evento } = req.body;
    try {
        const { data, error } = await supabase
            .from('inscricoes')
            .delete()
            .match({ id_usuario, id_evento });
        if (error) {
            throw new Error(error.message);
        }
        res.status(200).json({ message: 'Inscrição cancelada com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Frequencia

app.post('/registrar-frequencia', async (req, res) => {
    const { id_usuario, id_evento, data } = req.body;
    try {
        const { data: insertedData, error } = await supabase
            .from('frequencias')
            .insert([{ id_usuario, id_evento, data, presente: true }]);
        if (error) throw new Error(error.message);
        res.status(200).json({ message: 'Frequência registrada com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/listar-frequencias', async (req, res) => {
    const { id_usuario, role } = req.body;
    try {
        let query = supabase
            .from('frequencias')
            .select('*, eventos(titulo), usuarios(nome)')
            .eq('presente', true);
        
        if (role === 'organizador') {
            query = query.eq('id_usuario', id_usuario);
        }

        const { data: frequencias, error: frequenciasError } = await query;
        if (frequenciasError) throw new Error(frequenciasError.message);

        const certificacoesPromises = frequencias.map(async (frequencia) => {
            const { data: certificado, error: certificadoError } = await supabase
                .from('certificados')
                .select('*')
                .eq('id_usuario', frequencia.id_usuario)
                .eq('id_evento', frequencia.id_evento);

            if (certificadoError) throw new Error(certificadoError.message);

            return {
                ...frequencia,
                evento_titulo: frequencia.eventos.titulo,
                usuario_nome: frequencia.usuarios.nome,
                certificadoEmitido: certificado.length > 0
            };
        });

        const frequenciasComDetalhes = await Promise.all(certificacoesPromises);

        res.status(200).json(frequenciasComDetalhes);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/verificar-frequencia', async (req, res) => {
    const { id_usuario, id_evento } = req.body;
    try {
        const { data: frequencia, error } = await supabase
            .from('frequencias')
            .select('*')
            .eq('id_usuario', id_usuario)
            .eq('id_evento', id_evento)
            .single();

        if (error && error.details !== '0 rows') throw new Error(error.message);

        res.status(200).json({ frequenciaRegistrada: !!frequencia });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.post('/emitir-certificado', async (req, res) => {
    const { id_usuario, id_evento } = req.body;
    try {
        const { data, error } = await supabase
            .from('certificados')
            .insert([{ id_usuario, id_evento }]);
        if (error) throw new Error(error.message);
        res.status(200).json({ message: 'Certificado emitido com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/my-events', async (req, res) => {
    const { id_supabase } = req.body;
    try {
        const { data: inscricoes, error: inscricoesError } = await supabase
            .from('inscricoes')
            .select('id_evento')
            .eq('id_usuario', id_supabase);

        if (inscricoesError) throw new Error(inscricoesError.message);

        const eventosIds = inscricoes.map(inscricao => inscricao.id_evento);
        const { data: eventos, error: eventosError } = await supabase
            .from('eventos')
            .select('*')
            .in('id', eventosIds);

        if (eventosError) throw new Error(eventosError.message);

        res.status(200).json(eventos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/verificar-certificado', async (req, res) => {
    const { id_usuario, id_evento } = req.body;
    try {
        const { data: certificado, error } = await supabase
            .from('certificados')
            .select('*')
            .eq('id_usuario', id_usuario)
            .eq('id_evento', id_evento)
            .single();

        if (error && error.details !== '0 rows') {
            throw new Error(error.message);
        }

        res.status(200).json({ certificadoEmitido: !!certificado });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Certificados

app.post('/meus-certificados', async (req, res) => {
    const { id_usuario } = req.body;
    try {
        const { data: certificados, error: certificadosError } = await supabase
            .from('certificados')
            .select('*, eventos(titulo)')
            .eq('id_usuario', id_usuario);
        
        if (certificadosError) throw new Error(certificadosError.message);

        res.status(200).json(certificados);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Trabalhos

app.post('/submeter-trabalho', async (req, res) => {
    const { id_usuario, id_evento, trabalho } = req.body;
    try {
        const { data, error } = await supabase
            .from('trabalhos')
            .insert([{ id_usuario, id_evento, trabalho }]);
        if (error) throw new Error(error.message);
        res.status(200).json({ message: 'Trabalho submetido com sucesso!' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});


app.post('/meus-trabalhos', async (req, res) => {
    const { id_usuario } = req.body;
    try {
        const { data: trabalhos, error } = await supabase
            .from('trabalhos')
            .select('*, eventos(titulo)')
            .eq('id_usuario', id_usuario);
        if (error) throw new Error(error.message);

        const trabalhosComFeedback = await Promise.all(trabalhos.map(async (trabalho) => {
            const { data: feedback, error: feedbackError } = await supabase
                .from('feedbacks')
                .select('*, usuarios(nome)')
                .eq('id_trabalho', trabalho.id)
                .single();

            return {
                ...trabalho,
                feedback: feedback ? { ...feedback, nome_avaliador: feedback.usuarios.nome } : null
            };
        }));

        res.status(200).json(trabalhosComFeedback);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.post('/listar-trabalhos', async (req, res) => {
    const { id_usuario, role } = req.body;
    try {
        let query = supabase
            .from('trabalhos')
            .select('*, eventos(titulo), usuarios(nome)');

        if (role === 'organizador') {
            const { data: eventos, error: eventosError } = await supabase
                .from('eventos')
                .select('id')
                .eq('criado_por', id_usuario);
            if (eventosError) throw new Error(eventosError.message);

            const eventosIds = eventos.map(evento => evento.id);
            query = query.in('id_evento', eventosIds);
        }

        const { data: trabalhos, error } = await query;
        if (error) throw new Error(error.message);

        const trabalhosPendentes = await Promise.all(trabalhos.map(async (trabalho) => {
            const { data: feedbacks, error: feedbackError } = await supabase
                .from('feedbacks')
                .select('*')
                .eq('id_trabalho', trabalho.id);

            if (feedbackError) throw new Error(feedbackError.message);

            if (feedbacks.length === 0) {
                return trabalho;
            }
            return null;
        }));

        res.status(200).json(trabalhosPendentes.filter(trabalho => trabalho !== null));
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



app.post('/adicionar-feedback', async (req, res) => {
    const { id_trabalho, id_usuario, nota, comentario } = req.body;
    try {
        const { data, error } = await supabase
            .from('feedbacks')
            .insert([{ id_trabalho, id_usuario, nota, comentario }]);
        if (error) throw new Error(error.message);
        res.status(200).json({ message: 'Feedback adicionado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
