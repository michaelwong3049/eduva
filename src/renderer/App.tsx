import { createRoot } from 'react-dom/client';

import dogImage from '../../dog.jpeg';

function App() {
  return (
    <div style={{ 
      width: "100vw", 
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      backgroundColor: "#f5f5f5"
    }}>
      {/* <img  */}
      {/*   src={dogImage}  */}
      {/*   alt="Dog"  */}
      {/*   style={{  */}
      {/*     maxWidth: "200px",  */}
      {/*     maxHeight: "200px",  */}
      {/*     borderRadius: "8px", */}
      {/*     objectFit: "cover" */}
      {/*   }}  */}
      {/* /> */}
    </div>
  )
}

createRoot(document.body).render(<App />);
