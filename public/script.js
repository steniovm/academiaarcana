//elementos html
const chat = document.getElementById("chat");
const submitbt = document.getElementById("submitbt");
const username = document.getElementById("username");
const message = document.getElementById("message");
const messages = document.getElementById("messages");
const modal = document.getElementById("modal");
const modalform = document.getElementById("modalform");
const inusername = document.getElementById("inusername");
const typenarrador = document.getElementById("typenarrador");
const typeplayer = document.getElementById("typeplayer");
const caracterinfos = document.getElementById("caracterinfos");
const narradorname = document.getElementById("narradorname");
const caractername = document.getElementById("caractername");
const chartname1 = document.getElementById("chartname1");
const chartype1 = document.getElementById("chartype1");
const chartcondition1 = document.getElementById("chartcondition1");
const chartname2 = document.getElementById("chartname2");
const chartype2 = document.getElementById("chartype2");
const chartcondition2 = document.getElementById("chartcondition2");
const chartname3 = document.getElementById("chartname3");
const chartype3 = document.getElementById("chartype3");
const chartcondition3 = document.getElementById("chartcondition3");
const spellname1 = document.getElementById("spellname1");
const spelltype1 = document.getElementById("spelltype1");
const weakspell1 = document.getElementById("weakspell1");
const spellname2 = document.getElementById("spellname2");
const spelltype2 = document.getElementById("spelltype2");
const weakspell2 = document.getElementById("weakspell2");
const spellname3 = document.getElementById("spellname3");
const spelltype3 = document.getElementById("spelltype3");
const weakspell3 = document.getElementById("weakspell3");
const connectname = document.getElementById("connectname");
const connecttype = document.getElementById("connecttype");
const decriptcaracter = document.getElementById("decriptcaracter");
const submituser = document.getElementById("submituser");
const showusername = document.getElementsByClassName("showusername");
const caracterinfo = document.getElementsByClassName("caracterinfo");
const dicebt = document.getElementsByClassName("dicebt");
const mediabt = document.getElementsByClassName("mediabt");
const mainusers = document.getElementById("mainusers");
const showuserdiv = document.getElementsByClassName("showuserdiv");
const instruct = document.getElementById("instruct");
const framehelp = document.getElementById("framehelp");
const caracterinfosinput = document.querySelectorAll("#caracterinfos input");
const origdice = document.querySelectorAll(".origdice");
//encontra porta de comunicação
const PORT =
  location.protocol === "https:" ? 443 : location.port ? location.port : 3000;
//configura estado de audio e video padrão
const mediaopt = { video: true, audio: true };
//variaveis globais
let userdata = {}; //dados do usuario
let users = {}; //lista de usuarios
let streams = {}; //lista de streams reproduziveis
let minvalueteste = 7; //valor minimo para sucesso nos teste de rolagem de dados
let socket;
let peer;

//configura conexões
let isconnect = configConections();
async function configConections() {
  try {
    socket = await io(); //conexão de socket
    peer = await new Peer(); //conexão p2p
    //escutas de conexão
    peer.on("open", connectopen); //abre conexão com o servidor
    socket.on("adduser", createuser); //escuta usuario criado no servidor
    socket.on("previousMessages", premessages); //recebe mensagens anteriores a entrada do usuário
    socket.on("removeuser", removeuser); // remove usuario que desconectou
    socket.on("roolresult", roolresult); //escuta rolagem de dados
    socket.on("receivedMessage", receivedMessage); //escuta menssagens do chat
    socket.on("receivedpong", receivedpong); //escuta sinal para manter conexão ativa
    peer.on("call", reqcall); //escuta chamada p2p para videos
  } catch (error) {
    console.log(error);
    return false;
  }
  return true;
}
//gera id de conexão p2p
function connectopen(id) {
  userdata.pid = id;
  //console.log('My peer ID:', id);
}
chartype1.addEventListener("change", chartvalues);
chartype2.addEventListener("change", chartvalues);
chartype3.addEventListener("change", chartvalues);
function chartvalues(e) {
  const selectes = [chartype1, chartype2, chartype3];
  for (let i = 0; i < 3; i++) {
    if (selectes[i].id != e.target.id) {
      for (let j = 1; j < selectes[i].children.length; j++) {
        selectes[i].children[j].disabled = false;
        for (let k = 0; k < 3; k++) {
          if (k != i && selectes[i].children[j].value === selectes[k].value) {
            selectes[i].children[j].disabled = true;
          }
        }
      }
    }
  }
}
spelltype1.addEventListener("change", spellvalues);
spelltype2.addEventListener("change", spellvalues);
spelltype3.addEventListener("change", spellvalues);
function spellvalues(e) {
  const selectes = [spelltype1, spelltype2, spelltype3];
  for (let i = 0; i < 3; i++) {
    if (selectes[i].id != e.target.id) {
      for (let j = 1; j < selectes[i].children.length; j++) {
        selectes[i].children[j].disabled = false;
        for (let k = 0; k < 3; k++) {
          if (k != i && selectes[i].children[j].value === selectes[k].value) {
            selectes[i].children[j].disabled = true;
          }
        }
      }
    }
  }
}
//recebe usuario criado no servidor
function createuser(data) {
  data.videoconected = false; //define que o streamer de video está desconectado
  //console.log(data);
  //caso o usuário sejá o proprio jogador atualiza perfil
  if (data.username === userdata.username) {
    userdata.playnumber = data.playnumber;
    userdata.sid = data.sid;
    userdata.room = data.room;
    if (data.typeuser === "narrador") {
      userdata.status = data.status;
      renderMessage({
        author: "",
        message: `Bem vindo ao jogo Narrador <strong>${
          data.username
        }</strong>, convide três jogadores para iniciar sua aventura pelo link <a href="${
          location.origin + "?narrador=" + userdata.narradorname
        }" target="_blank">${
          location.origin + "?narrador=" + userdata.narradorname
        }</a> .`,
      });
    } else if (data.status.narrador && data.status.user && data.status.vaga) {
      userdata.status = true;
      renderMessage({
        author: "",
        message: `Bem vindo ao jogo <strong>${data.username}</strong>.`,
      });
    } else {
      userdata.status = false;
    }
  } else {
    renderMessage({
      author: "",
      message: `O jogador <strong>${data.username}</strong> entrou com o personagem: <strong>${data.caractername}</strong>.`,
    });
    if (data.typeuser === "narrador") {
      userdata.typegame = data.typegame;
    }
  }
  //salva usuario na memória local
  if (!users[data.username]) {
    users[data.username] = data;
    showdatauser(data);
  }
  if (data.username === userdata.username) {
    videoinit(data.username);
    pingpong();
  }
}
//recebe mensagens previas (desativado)
function premessages(premess) {
  if (premess.username === userdata.username)
    premess.hist.forEach((el) => {
      renderMessage(el);
    });
}
//formulario modal de login
//mostra/esconde o campos do personagem de acordo com o tipo de usuario (jogador/narrador)
typenarrador.addEventListener("click", () => {
  caracterinfos.classList.add("hiddemdiv");
  //narrinfos.classList.remove("hiddemdiv");
  caracterinfosinput.forEach((el) => {
    el.required = false;
  });
});
typeplayer.addEventListener("click", () => {
  caracterinfos.classList.remove("hiddemdiv");
  //narrinfos.classList.add("hiddemdiv");
  caracterinfosinput.forEach((el) => {
    el.required = true;
  });
});
//faz leitura de query url se houver
const queryURL = new URLSearchParams(location.search).get("narrador");
if (queryURL) {
  typeplayer.click();
  narradorname.value = queryURL;
}
//mostra/esconde tutorial de uso
instruct.addEventListener("click", function () {
  framehelp.classList.toggle("displaynone");
});

//renderiza mensagem no campo de chat
function renderMessage(messag) {
  messages.innerHTML += `<div class="message"><strong>${messag.author}: </strong>${messag.message}</div>`;
  messages.scrollTo({
    top: Array.from(messages.childNodes).reduce(
      (acc, v) => acc + v.clientHeight,
      0
    ),
    behavior: "smooth",
  });
}

//envio de formulario para login
modalform.addEventListener("submit", (ev) => {
  ev.preventDefault(); //evita carregamento da pagina
  if (isconnect) {
    modal.classList.add("hiddemdiv"); //apaga o modal do form da pagina
    let data = new FormData(modalform); //dados do formulario
    const pid = userdata.pid;
    userdata = Object.fromEntries(data); //pega dados dos campos imput
    userdata.pid = pid;
    username.value = data.get("username"); //preenche o campo input type=hidden
    if (data.get("typeuser") === "narrador") {
      //caso o usuario seja um narrador
      userdata.narradorname = userdata.username;
      userdata.caractername = "narrador";
    } else if (data.get("typeuser") === "jogador") {
      //caso o usuario seja um jogador
      //console.log('usuario jogador');
    }
    console.log(userdata);
    try {
      socket.emit("sendUser", userdata);
      renderMessage({
        author: "",
        message: "<strong>Bem Vindo à Academia Arcana</strong>",
      });
    } catch (error) {
      console.log(error);
      modal.classList.remove("hiddemdiv"); //retorna o modal do form para a pagina
    }
  } else {
    alert(
      "falha de acesso, verifique sua conexão com internet e recarregue a página"
    );
  }
});

//renderiza tela de usuário
function showdatauser(datauser) {
  const newuser = document.createElement("div");
  newuser.classList.add("showuserdiv");
  if (datauser.typeuser === "narrador") {
    newuser.classList.add("divnarrador");
    newuser.title = `Pessoa Narradora`;
  } else {
    newuser.title = `${datauser.decriptcaracter || ""}
  Caracteristicas:
    ${datauser.chartname1 || ""} Tipo:${datauser.chartype1 || ""} Condição:${
      datauser.chartcondition1 || ""
    }
    ${datauser.chartname2 || ""} Tipo:${datauser.chartype2 || ""} Condição:${
      datauser.chartcondition2 || ""
    }
    ${datauser.chartname3 || ""} Tipo:${datauser.chartype3 || ""} Condição:${
      datauser.chartcondition3 || ""
    }
  Feitiços:
    ${datauser.spellname1 || ""} Tipo:${datauser.spelltype1 || ""} Fraqueza:${
      datauser.weakspell1 || ""
    }
    ${datauser.spellname2 || ""} Tipo:${datauser.spelltype2 || ""} Fraqueza:${
      datauser.weakspell2 || ""
    }
    ${datauser.spellname3 || ""} Tipo:${datauser.spelltype3 || ""} Fraqueza:${
      datauser.weakspell3 || ""
    }
  Conexão:
    ${datauser.connectname || ""} Tipo:${datauser.connecttype || ""}`;
  }
  newuser.innerHTML = `<span class="showusername">${
    datauser.username || ""
  }</span>
            <label class="caracterinfo ${
              datauser.typeuser === "narrador" ? "hiddemdiv" : ""
            }">
                <strong class="atrr">${datauser.caracteratrib || ""}</strong>
                <span class="caract">${datauser.caractername || ""}</span>
            </label>`;
  users[datauser.username].scr = newuser;
  const videouser = document.createElement("video");
  users[datauser.username].videoscreen = videouser;
  newuser.appendChild(videouser);
  mainusers.appendChild(newuser);
}
//remove usuario que saiu
function removeuser(user) {
  users[user].scr.remove();
  renderMessage({
    author: "",
    message: "Usuário <strong>" + user + "</strong> desconectou.",
  });
  delete users[user];
}
//submissão de mensagens do chat
chat.addEventListener("submit", (ev) => {
  ev.preventDefault();
  author = username.value;
  mess = message.value;

  if (author && mess) {
    let messageObject = {
      author: author,
      message: mess,
    };
    //renderMessage(messageObject);
    socket.emit("sendMessage", messageObject);
  }
  message.value = "";
});

function receivedMessage(messag) {
  renderMessage(messag);
}

//botões de rolagem de dados
for (let i = 0; i < dicebt.length; i++) {
  let rolldices = { nroll: 2, dicetype: "d6", modific: i };
  dicebt[i].addEventListener("click", (ev) => {
    ev.preventDefault();
    //dados para rolagem
    rolldices.user = userdata.username;
    rolldices.room = userdata.narradorname || userdata.username;
    rolldices.minvalue = minvalueteste;
    try {
      socket.emit("rollDice", rolldices); //envia solicitação
      console.log(rolldices);
    } catch (error) {
      console.log(error);
      renderMessage({
        author: "",
        message:
          "Falha ao enviar solicitação de rolagem de dados, tente novamente.",
      });
    }
  });
}

//resultado de rolagem de dados
function roolresult(result) {
  console.log(result);
  renderMessage({
    author: result.user,
    message: `Rolagem: ${result.values.join("+")} = ${result.values.reduce(
      (p, c) => p + c
    )} : ${result.result}`,
  });
}

async function addVideoStream(video, stream) {
  let result = false;
  try {
    video.srcObject = stream; //sinal de video associado ao elemento
    await video.addEventListener("loadedmetadata", () => {
      //evento de carregar meta dados
      video.play(); //inicia reprodução
      result = true;
    });
  } catch (error) {
    console.log(error);
    renderMessage({ author: "error", message: error });
  }
  return result;
}

async function videoinit(user) {
  await navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: true,
    })
    .then(async (stream) => {
      streams[user] = stream;
      const result = await addVideoStream(users[user].videoscreen, stream); //adciona video local na tela
      if (result) users[user].videoconected = true;
      intervalvideo();
    })
    .catch((error) => {
      console.log(error);
    });
  let ouser;
  Object.keys(users).forEach((el) => {
    if (el !== userdata.username && !users[el].videoconected) {
      ouser = el;
    }
  });
  if (ouser) calltouser(ouser);
}

//realiza ligação enviando stream
async function calltouser(user) {
  const call = await peer.call(users[user].pid, streams[userdata.username]);
  call.on("stream", async (remoteStream) => {
    if (!users[user].videoconected) {
      const result = await addVideoStream(
        users[user].videoscreen,
        remoteStream
      );
      if (result) users[user].videoconected = true;
    }
  });
}

//recebe ligação com stream
function reqcall(call) {
  call.answer(streams[userdata.username]);
  call.on("stream", function (stream) {
    Object.keys(users).forEach(async (el) => {
      if (users[el].pid === call.peer) {
        streams[el] = stream;
        const result = await addVideoStream(users[el].videoscreen, streams[el]);
        if (result) users[el].videoconected = true;
      }
    });
  });
}
//reconecta caso conexões p2p tenham caido
let interval;
function intervalvideo() {
  interval = setInterval(() => {
    Object.keys(users).forEach((el) => {
      if (!users[el].videoconected && el !== userdata.username) {
        calltouser(users[el].username);
      }
    });
  }, 60000); //a cada minuto verifica se há algum usuário sem conexão de video
  //console.log('verifica a cada minuto:',interval);
}
//evento de liga/desliga audio
mediabt[0].addEventListener("click", () => {
  try {
    const enabled = streams[userdata.username].getAudioTracks()[0].enabled; //propriedade de audio ligado/desligado
    if (enabled) {
      //se audio ligado
      streams[userdata.username].getAudioTracks()[0].enabled = false; //desliga audio
      mediabt[0].classList.add("borderoff"); //altera botão
    } else {
      //se audio desligado
      streams[userdata.username].getAudioTracks()[0].enabled = true; //liga audio
      mediabt[0].classList.remove("borderoff"); //altera botão
    }
  } catch (error) {
    console.log(error);
  }
});
//evento de liga/desliga video
mediabt[1].addEventListener("click", () => {
  try {
    const enabled = streams[userdata.username].getVideoTracks()[0].enabled; //propriedade de audio ligado/desligado
    if (enabled) {
      //se audio ligado
      streams[userdata.username].getVideoTracks()[0].enabled = false; //desliga audio
      mediabt[1].classList.add("borderoff"); //altera botão
    } else {
      //se audio desligado
      streams[userdata.username].getVideoTracks()[0].enabled = true; //liga audio
      mediabt[1].classList.remove("borderoff"); //altera botão
    }
  } catch (error) {
    console.log(error);
  }
});
let intervalpp;
let todesconected = 3;
async function pingpong() {
  //solicitação vazia para o servidor, apenas para manter conexão ativa
  intervalpp = setInterval(() => {
    if (todesconected === 0) {
      renderMessage({
        author: "",
        message: "<strong>Você desconectou.</strong>",
      });
      clearInterval(intervalpp);
    } else {
      const time = new Date().getTime();
      socket.emit("sendping", time);
      todesconected--;
    }
  }, 5000);
}
async function receivedpong(pingtime) {
  if (pingtime) {
    const time = new Date().getTime();
    if (time - pingtime > 500) console.log("ping", time - pingtime, "ms");
    todesconected = 3;
    return true;
  } else {
    isconnect = configConections();
    return false;
  }
}
