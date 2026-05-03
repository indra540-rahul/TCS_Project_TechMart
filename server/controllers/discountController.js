import DiscountRequest from "../models/DiscountRequest.js";
import { createAuditLog } from "../utils/inventoryHelpers.js";

export const approveDiscount = async (req, res) => {
  try {
    const discount = await DiscountRequest.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("product", "name");

    if (!discount) {
      return res.status(404).json({ message: "Discount request not found" });
    }

    await createAuditLog({
      user: req.user._id,
      role: req.user.role,
      action: "High discount approved",
      module: "discounts",
      details: `${discount.percentage}% approved for ${discount.product?.name || "product"}`
    });

    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: "Failed to approve discount", error: error.message });
  }
};
