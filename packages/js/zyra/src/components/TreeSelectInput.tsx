import React from 'react';
import { TreeSelect } from 'antd';

interface TreeNode {
    title: string | JSX.Element;
    value: string;
    children?: TreeNode[];
}

interface TreeSelectInputProps {
    wrapperClass?: string;
    name?: string;
    multiple?: boolean;
    treeData: TreeNode[];
    value?: string | string[];
    inputClass?: string;
    onChange?: (value: any) => void;
    proSetting?: boolean;
    description?: string;
    descClass?: string;
    preText?: string;
    postText?: string;
    size?: string;
}

const TreeSelectInput: React.FC<TreeSelectInputProps> = ({
    wrapperClass,
    name,
    multiple = false,
    treeData,
    value,
    inputClass,
    onChange,
    proSetting,
    description,
    descClass,
    preText,
    postText,
    size,
}) => {
    return (
        <div className={wrapperClass} style={{ width: size || "100%" }}>
            <div className="treeselect-wrapper">

                {preText && <div className="before">{preText}</div>}

                <TreeSelect
                    showSearch
                    allowClear
                    treeDefaultExpandAll
                    className={`${inputClass} react-tree-select`}
                    treeNodeFilterProp="title" // important for filtering

                    filterTreeNode={(input, node) => {
                        const title = String(node.title ?? "").toLowerCase();
                        const search = input.toLowerCase();
                        return title.includes(search);
                    }}
                    style={{ width: "50%" }}
                    value={value}
                    multiple={multiple}
                    placeholder="Please select"
                    treeData={treeData}
                    styles={{
                        popup: {
                            root: { maxHeight: 400, overflow: "auto" },
                        },
                    }}
                    onChange={(newValue) => onChange?.(newValue)}
                />

                {postText && <div className="after">{postText}</div>}
            </div>

            {description && (
                <p
                    className={descClass}
                    dangerouslySetInnerHTML={{ __html: description }}
                ></p>
            )}

            {proSetting && (
                <div className="pro-overlay">
                    <span>Pro</span>
                </div>
            )}
        </div>
    );
};

export default TreeSelectInput;
