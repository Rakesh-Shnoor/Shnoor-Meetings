export default function ParticipantsPanel({ participants }) {
  return (
    <div className="w-64 bg-gray-900 text-white p-4">
      <h2 className="text-lg mb-4">Participants</h2>

      {participants.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <img src={p.picture} className="w-6 h-6 rounded-full" />
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
}