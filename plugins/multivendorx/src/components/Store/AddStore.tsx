import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {BasicInput, TextArea} from 'zyra';

const AddStore = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
        <Link
            to="?page=multivendorx#&tab=store-management"
            className="button"
            >
            Back
        </Link>
        <div>
            <h3>Add New Store</h3>
            <label>Name</label>
            <BasicInput
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}

            />
            <label>Slug</label>
            <BasicInput
                type="text"
                value=""
                onChange={handleChange}

            />
            <label>Description</label>
            <TextArea
                value=""
                onChange={handleChange}
            />
            <br/>
            <button className="button">Submit</button>
        </div>
    </>
  );
};

export default AddStore;
