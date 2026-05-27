import { useState, useEffect, useCallback } from "react";

// Definimos a interface para garantir o tipo dos dados
interface Friend {
  id: number;
  username: string;
  is_online: boolean;
}

// Interface para os pedidos de amizade
interface FriendRequest {
  id: number;
  sender: { username: string };
}

interface FriendsListProps {
  username: string; // Nota: No futuro, podes preferir usar userId para consistência com o Backend
}

export default function FriendsList({ username }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]); // Estado para pedidos
  const [newFriendId, setNewFriendId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Função para carregar a lista de amigos do backend.
   * Utiliza useCallback para evitar que a função seja recriada em cada renderização.
   */
  const loadFriends = useCallback(() => {
    fetch(`http://localhost:3000/users/${username}/friends`)
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error("Erro ao carregar amigos:", err));
  }, [username]);

  /**
   * Função para carregar os pedidos de amizade pendentes.
   */
  const loadPendingRequests = useCallback(() => {
    // Ajusta o URL conforme o teu controller (ex: passando o ID do user)
    fetch(`http://localhost:3000/friend-requests/pending/${username}`)
      .then((res) => res.json())
      .then((data) => setPendingRequests(data))
      .catch((err) => console.error("Erro ao carregar pedidos:", err));
  }, [username]);

  // Efeito para carregar os amigos e pedidos ao montar o componente
  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, [loadFriends, loadPendingRequests]);

  /**
   * Envia uma requisição POST para criar um pedido de amizade.
   */
  const handleAddFriend = async () => {
    if (!newFriendId) return;

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/friend-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderUsername: username, receiverUsername: newFriendId }),
      });

      if (res.ok) {
        setNewFriendId("");
        alert("Pedido de amizade enviado!");
      } else {
        alert("Erro ao enviar pedido.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Aceita um pedido de amizade.
   */
  const handleAcceptRequest = async (requestId: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/friend-requests/${requestId}/accept`, {
        method: 'PATCH',
      });

      if (res.ok) {
        loadFriends(); // Atualiza lista de amigos
        loadPendingRequests(); // Atualiza lista de pedidos
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Remove um amigo através de uma requisição DELETE.
   */
  const removeFriend = async (friendUsername: string) => {
    if (!window.confirm(`Tens a certeza que queres remover ${friendUsername} da tua lista?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/${username}/friends/${friendUsername}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadFriends();
      } else {
        alert("Erro ao remover amigo.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container principal do componente com estilos de borda e padding
    <div className="bg-[#1a1a1a] border border-[#333] p-6 rounded-lg w-full">
      
      {/* Título da secção */}
      <h3 className="text-[#00ff9d] mb-4 uppercase font-bold tracking-widest">
        Friends List
      </h3>

      {/* Lista renderizada dinamicamente baseada no estado 'friends' */}
      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className="flex justify-between items-center bg-black p-3 rounded border border-[#333]">
            
            {/* Informação do utilizador e estado online */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${friend.is_online ? "bg-[#00ff9d]" : "bg-gray-600"}`} />
              <span className="text-white text-sm">{friend.username}</span>
            </div>

            {/* Botão de remoção */}
            <button
              onClick={() => removeFriend(friend.username)}
              disabled={isLoading}
              className={`text-red-500 hover:text-red-400 text-xs uppercase ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Remover
            </button>
          </div>
        ))}
      </div>

      {/* Nova Secção: Pedidos Pendentes */}
      {pendingRequests.length > 0 && (
        <div className="mt-6 border-t border-[#333] pt-4">
          <h4 className="text-white text-xs uppercase mb-2">Pedidos Pendentes</h4>
          {pendingRequests.map((req) => (
            <div key={req.id} className="flex justify-between items-center bg-[#222] p-2 rounded mb-2">
              <span className="text-white text-sm">{req.sender.username}</span>
              <button 
                onClick={() => handleAcceptRequest(req.id)}
                className="text-[#00ff9d] text-xs uppercase font-bold"
              >
                Aceitar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Área para introduzir novo amigo */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={newFriendId}
          onChange={(e) => setNewFriendId(e.target.value)}
          placeholder="Username para adicionar"
          className="bg-black border border-[#333] text-white p-2 rounded text-sm w-full"
          disabled={isLoading}
        />

        {/* Botão de envio (Add) */}
        <button
          onClick={handleAddFriend}
          disabled={isLoading}
          className={`bg-[#00ff9d] text-black font-bold p-2 rounded text-xs uppercase hover:bg-green-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? "Enviando..." : "Add"}
        </button>
      </div>
    </div>
  );
}