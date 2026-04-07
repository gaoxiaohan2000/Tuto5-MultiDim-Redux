import './Hierarchy.css';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCommunities } from '../../redux/DataSetSlice';

import HierarchyD3 from './HierarchyD3';

function HierarchyContainer() {
    const visData = useSelector(state => state.dataSet.dataSet);
    const selectedCommunities = useSelector(state => state.dataSet.selectedCommunities || []);
    
    const dispatch = useDispatch();                    
    const divContainerRef = useRef(null);
    const hierarchyD3Ref = useRef(null);

    // 1. Initialize D3
    useEffect(() => {   
        const hierarchyD3 = new HierarchyD3(divContainerRef.current);
        hierarchyD3.create({ size: { width: 600, height: 600 } });
        hierarchyD3Ref.current = hierarchyD3;

        return () => hierarchyD3Ref.current?.clear();
    }, []);

    // 2. Rendering + Highlight Synchronization
    useEffect(() => {
        const hierarchyD3 = hierarchyD3Ref.current;
        if (!hierarchyD3 || !visData || visData.length === 0) return;


        const handleNodeClick = (nodeData) => {
            console.log("Hierarchy node clicked:", nodeData);
            dispatch(setSelectedCommunities([nodeData]));   
        };

        const controllerMethods = {
            handleNodeClick,
        };

        hierarchyD3.renderHierarchy(visData, selectedCommunities, controllerMethods);
    }, [visData, selectedCommunities, dispatch]);

    return (
        <div 
            ref={divContainerRef} 
            className="hierarchyDivContainer"
            style={{
                height: "600px",
                width: "100%",
                border: "1px solid #ccc",
                position: "relative",
                backgroundColor: "#fafafa"
            }}
        />
    );
}

export default HierarchyContainer;