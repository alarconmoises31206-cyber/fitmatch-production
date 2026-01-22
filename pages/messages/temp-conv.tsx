export default function ConversationPage() {
  const sendTestMessage = () => {
    // Test localStorage directly
    const testData = [{id: "test", message: "Hello"}];
    localStorage.setItem("fitmatch_test", JSON.stringify(testData));
    alert("Test data saved to localStorage!");
    
    // Try to read it back
    const readData = localStorage.getItem("fitmatch_test");
    console.log("Read back:", readData);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Conversation Page</h1>
      <p className="text-gray-600 mt-2">Testing localStorage persistence</p>
      
      <div className="mt-4 space-y-4">
        <button 
          onClick={sendTestMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test localStorage
        </button>
        
        <div className="p-4 bg-gray-100 rounded">
          <p className="text-sm">Check browser console (F12) after clicking the button.</p>
        </div>
      </div>
    </div>
  );
}
