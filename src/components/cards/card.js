// import React from 'react';
// import styled from 'styled-components';

// const Cards = ({ title, onClick, videoUrl, isSelected }) => {
//   return (
//     <CardContainer onClick={onClick} isSelected={isSelected}>
//       <VideoPreview src={videoUrl} muted loop autoPlay />
//       <Title>{title}</Title>
//     </CardContainer>
//   );
// };

// const CardContainer = styled.div`
//   flex: 1 0 20%; /* Adjust width as needed */
//   display: flex;
//   flex-direction: column;
//   justify-content: flex-end;
//   background: black; /* Set background color to black */
//   border: none; /* Ensure no border is applied */
//   border-radius: 0; /* Ensure no border radius */
//   box-shadow: none; /* Ensure no box shadow */
//   margin-right: 5px; /* Adjust margin to fit cards properly */
//   padding: 0; /* Ensure no extra padding */
//   cursor: pointer;
//   height: 100%; /* Ensure height adjusts to fit the container */
//   overflow: hidden;
//   opacity: ${({ isSelected }) => (isSelected ? 0 : 1)}; /* Hide selected card */
//   transition: opacity 0.5s ease, transform 0.3s ease; /* Smooth transition for opacity and scaling */
  
//   &:last-child {
//     margin-right: 0;
//   }

//   &:hover {
//     background: #333; /* Slightly lighter black on hover */
//     transform: scale(1.05); /* Slightly increase size on hover */
//   }
// `;

// const VideoPreview = styled.video`
//   width: 100%;
//   height: 100%; /* Adjust height to fit in the container */
//   object-fit: cover;
//   border: none; /* Ensure no border around the video */
//   border-radius: 0; /* Ensure no border radius around the video */
// `;

// const Title = styled.div`
//   font-size: 12px; /* Adjust font size for better fit */
//   color: white; /* Set text color to white for contrast */
//   background: rgba(0, 0, 0, 0.5); /* Semi-transparent black background for the title */
//   text-align: center;
//   padding: 3px;
//   border: none; /* Ensure no border around the title */
//   border-radius: 0; /* Ensure no border radius around the title */
//   margin-top: 0; /* Adjust margin if needed */
// `;

// export default Cards;
