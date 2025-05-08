// "use client";

// import React, { useState } from "react";

// interface UsernameInputProps {
//   onUsernameSet: (username: string) => void;
// }

// export default function UsernameInput({ onUsernameSet }: UsernameInputProps) {
//   const [username, setUsername] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (username.trim()) {
//       onUsernameSet(username);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-[url('/dapp/battle/dapp-bg.png')] bg-cover bg-center">
//       <div className="bg-black/60 backdrop-blur-md p-8 rounded-xl text-white text-center">
//         <h2 className="text-2xl font-bold mb-4 font-dark-mystic">Enter Your Username</h2>
//         <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
//           <input
//             type="text"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//             placeholder="Username"
//             className="bg-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400"
//             required
//           />
//           <button
//             type="submit"
//             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
//           >
//             Continue
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// } 