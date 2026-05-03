import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import ProductForm from "./ProductForm";

const EditProduct = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await api.get(`/products/${id}`);
      setProduct({
        ...data,
        category: data.category?._id || data.category,
        expiryDate: data.expiryDate || "",
        attributes: data.attributes || {}
      });
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return <div className="flex min-h-screen items-center justify-center">Loading product...</div>;
  }

  return <ProductForm initialValues={product} isEdit productId={id} />;
};

export default EditProduct;
