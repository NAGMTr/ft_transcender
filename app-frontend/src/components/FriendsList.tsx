import { useState, useEffect, useCallback } from "react";

// Definimos a interface para garantir o tipo dos dados
interface Friend {
  id: number;
  username: string;
  isOnline: boolean;
}

interface FriendsListProps {
  username: string;
}

export default function FriendsList({ username }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newFriendId, setNewFriendId] = useState("");

  // Função para carregar a lista (usamos useCallback para evitar recriação desnecessária)
  const loadFriends = useCallback(() => {
    fetch(`http://localhost:3000/users/${username}/friends`)
      .then(res => res.json())
      .then(data => setFriends(data))
      .catch(err => console.error("Erro ao carregar amigos:", err));
  }, [username]);

  // Carrega a lista ao montar o componente ou mudar o username
  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Lógica para enviar o POST e adicionar um novo amigo
  const handleAddFriend = () => {
    // Alterado para usar o username no final do URL
    fetch(`http://localhost:3000/users/${username}/friends/${newFriendId}`, {
      method: 'POST',
    })
      .then(res => {
        if (res.ok) {
          setNewFriendId("");
          loadFriends();
          alert("Amigo adicionado!");
        } else {
          alert("Erro ao adicionar amigo. Verifique se o username está correto.");
        }
      })
      .catch(err => console.error("Erro:", err));
  };

  // Lógica de remoção (endpoint DELETE)
  const removeFriend = (friendUsername: string) => {
    // LOGS DE DEBUGGING
    console.log("--- DEBUG REMOVE FRIEND ---");
    console.log("O que recebi na função:", friendUsername); 
    console.log("Prop 'username' (quem está logado):", username);
    
    if (!friendUsername) {
        console.error("ERRO: O username do amigo está VAZIO ou NULL!");
        return; 
    }

    // Construção explícita para ver o que vai ser enviado
    const url = `http://localhost:3000/users/${username}/friends/${friendUsername}`;
    //console.log("URL final da chamada:", url);

    fetch(url, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          //console.log("Sucesso!");
          loadFriends(); 
        } else {
          console.error("Falha no DELETE. Status:", res.status);
        }
      })
      .catch(err => console.error("Erro na rede:", err));
  };

return (
  // Container principal que envolve todo o componente
  <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-lg w-full">
    
    {/* Título da secção com estilo próprio */}
    <h3 className="text-[#00ff9d] mb-4 uppercase font-bold tracking-widest">
      Friends List
    </h3>
    
    {/* Lista de amigos (Iteramos sobre o estado 'friends') */}
    <div className="space-y-3">
      {friends.map((friend) => (
        // Cada linha de amigo individual
        <div key={friend.id} className="flex justify-between items-center bg-black p-3 rounded border border-[#333]">
          
          {/* Bloco esquerdo: Status (Online/Offline) e nome */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${friend.isOnline ? "bg-[#00ff9d]" : "bg-gray-600"}`} />
            <span className="text-white text-sm">{friend.username}</span>
          </div>
          
          {/* Bloco direito: Ação de remover */}
          <button 
            onClick={() => { removeFriend(friend.username);
            }}
            className="text-red-500 hover:text-red-400 text-xs uppercase"
          >
            Remover
          </button>
        </div>
      ))}
    </div>

    {/* Input para adicionar amigo por NOME */}
    <div className="mt-6 flex gap-2">
      <input 
        type="text" // Alterado de "number" para "text"
        value={newFriendId}
        onChange={(e) => setNewFriendId(e.target.value)}
        placeholder="Username do amigo" // Placeholder atualizado
        className="bg-black border border-[#333] text-white p-2 rounded text-sm w-full"
      />
      
      {/* Botão para disparar a função de adição */}
      <button 
        onClick={handleAddFriend}
        className="bg-[#00ff9d] text-black font-bold p-2 rounded text-xs uppercase hover:bg-green-400"
      >
        Add
      </button>
    </div>
  </div>
);
}