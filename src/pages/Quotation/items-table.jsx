"use client";
import { PlusIcon, TrashIcon } from "../../components/Icons";

const ItemsTable = ({
  quotationData,
  handleItemChange,
  handleAddItem,
  specialDiscount,
  setSpecialDiscount,
  productCodes,
  productNames,
  productData,
  setQuotationData,
  handleSpecialDiscountChange,
  isLoading,
  hiddenColumns,
  setHiddenColumns,
}) => {
  // Use props instead of local state
  const hideDisc = hiddenColumns?.hideDisc || false;
  const hideFlatDisc = hiddenColumns?.hideFlatDisc || false;
  const hideTotalFlatDisc = hiddenColumns?.hideTotalFlatDisc || false;
  const hideSpecialDiscount = hiddenColumns?.hideSpecialDiscount || false;
  const hideDescription = hiddenColumns?.hideDescription || false;

  const calculateColSpan = () => {
    let baseSpan = 9;
    if (hideDisc) baseSpan -= 1;
    if (hideFlatDisc) baseSpan -= 1;
    if (hideDescription) baseSpan -= 1;
    return baseSpan.toString();
  };

  // Calculate taxable amount - this is subtotal (which already has flat discount applied to items)
  const taxableAmount = Math.max(0, quotationData.subtotal || 0);

  // CSS to remove up-down buttons from number inputs
  const spinnerCSS = `
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
  `;

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm">
      <style>{spinnerCSS}</style>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Items</h3>
          <div className="flex flex-wrap gap-2">
            <button
              className="px-2 py-1 text-xs text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={() =>
                setHiddenColumns((prev) => ({
                  ...prev,
                  hideDescription: !prev.hideDescription,
                }))
              }
            >
              {hideDescription ? "Show" : "Hide"} Description
            </button>

            <button
              className="px-2 py-1 text-xs text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={() =>
                setHiddenColumns((prev) => ({
                  ...prev,
                  hideDisc: !prev.hideDisc,
                }))
              }
            >
              {hideDisc ? "Show" : "Hide"} Disc%
            </button>
            <button
              className="px-2 py-1 text-xs text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={() =>
                setHiddenColumns((prev) => ({
                  ...prev,
                  hideFlatDisc: !prev.hideFlatDisc,
                }))
              }
            >
              {hideFlatDisc ? "Show" : "Hide"} Flat Disc
            </button>
            <button
              className="px-2 py-1 text-xs text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={() =>
                setHiddenColumns((prev) => ({
                  ...prev,
                  hideTotalFlatDisc: !prev.hideTotalFlatDisc,
                }))
              }
            >
              {hideTotalFlatDisc ? "Show" : "Hide"} Total Flat Disc
            </button>
            <button
              className="px-2 py-1 text-xs text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={() =>
                setHiddenColumns((prev) => ({
                  ...prev,
                  hideSpecialDiscount: !prev.hideSpecialDiscount,
                }))
              }
            >
              {hideSpecialDiscount ? "Show" : "Hide"} Special Disc
            </button>
            <button
              className="px-3 py-1 text-sm text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
              onClick={handleAddItem}
              disabled={isLoading}
            >
              <PlusIcon className="inline mr-1 w-4 h-4" /> Add Item
            </button>
          </div>
        </div>

        <div
          className="overflow-x-auto relative"
          onWheel={(e) => e.preventDefault()}
        >
          {isLoading && (
            <div className="flex absolute inset-0 z-10 justify-center items-center bg-white bg-opacity-70">
              <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
            </div>
          )}
          <table
            className="min-w-full divide-y divide-gray-200"
            onWheel={(e) => e.preventDefault()}
          >
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  S No.
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Code
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Product Name
                </th>
                {!hideDescription && (
                  <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                    Description
                  </th>
                )}
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  GST %
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Qty.
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Units
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Rate
                </th>
                {!hideDisc && (
                  <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                    Disc %
                  </th>
                )}
                {!hideFlatDisc && (
                  <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                    Flat Disc
                  </th>
                )}
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-2 text-xs font-medium text-left text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotationData.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{index + 1}</td>

                  <td className="px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => {
                          handleItemChange(item.id, "code", e.target.value);
                          if (productData[e.target.value]) {
                            const productInfo = productData[e.target.value];
                            handleItemChange(item.id, "name", productInfo.name);
                            handleItemChange(
                              item.id,
                              "description",
                              productInfo.description
                            );
                            handleItemChange(item.id, "rate", productInfo.rate);
                          }
                        }}
                        list={`code-list-${item.id}`}
                        className="p-1 w-24 rounded-md border border-gray-300"
                        disabled={isLoading}
                      />
                      <datalist id={`code-list-${item.id}`}>
                        {productCodes.map((code) => (
                          <option key={code} value={code} />
                        ))}
                      </datalist>
                    </div>
                  </td>

                  <td className="px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          handleItemChange(item.id, "name", e.target.value);
                          if (productData[e.target.value]) {
                            const productInfo = productData[e.target.value];
                            handleItemChange(item.id, "code", productInfo.code);
                            handleItemChange(
                              item.id,
                              "description",
                              productInfo.description
                            );
                            handleItemChange(item.id, "rate", productInfo.rate);
                          }
                        }}
                        list={`name-list-${item.id}`}
                        className="p-1 w-full rounded-md border border-gray-300"
                        placeholder="Enter item name"
                        disabled={isLoading}
                        required
                      />
                      <datalist id={`name-list-${item.id}`}>
                        {productNames.map((name) => (
                          <option key={name} value={name} />
                        ))}
                      </datalist>
                    </div>
                  </td>

                  {!hideDescription && (
                    <td className="px-4 py-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleItemChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                          className="p-1 w-full rounded-md border border-gray-300"
                          placeholder="Enter description"
                          disabled={isLoading}
                        />
                      </div>
                    </td>
                  )}

                  <td className="px-4 py-2">
                    <select
                      value={String(item.gst)}
                      onChange={(e) =>
                        handleItemChange(item.id, "gst", e.target.value)
                      }
                      className="p-1 w-20 rounded-md border border-gray-300"
                      disabled={isLoading}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="18">18%</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*"
                      value={item.qty || ""}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "qty",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="p-1 w-16 rounded-md border border-gray-300"
                      placeholder=""
                      onWheel={(e) => e.preventDefault()}
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.units}
                      onChange={(e) =>
                        handleItemChange(item.id, "units", e.target.value)
                      }
                      className="p-1 w-20 rounded-md border border-gray-300"
                      disabled={isLoading}
                    >
                      <option value="Nos">Nos</option>
                      <option value="Kg">Kg</option>
                      <option value="Roll">Roll</option>
                      <option value="Rmt">Rmt</option>
                      <option value="Ltr">Ltr</option>
                      <option value="Bag">Bag</option>
                      <option value="Pair">Pair</option>
                      <option value="Set">Set</option>
                      <option value="Mtr">Mtr</option>
                      <option value="sqmtr">sqmtr</option>
                      <option value="Box">Box</option>
                      <option value="Pc">Pc</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      value={item.rate || ""}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          "rate",
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="p-1 w-24 rounded-md border border-gray-300"
                      placeholder=""
                      onWheel={(e) => e.preventDefault()}
                      disabled={isLoading}
                      required
                    />
                  </td>
                  {!hideDisc && (
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={item.discount || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "discount",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="p-1 w-20 rounded-md border border-gray-300"
                        placeholder=""
                        onWheel={(e) => e.preventDefault()}
                        min="0"
                        max="100"
                        disabled={isLoading}
                      />
                    </td>
                  )}
                  {!hideFlatDisc && (
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        inputMode="decimal"
                        pattern="[0-9]*"
                        value={item.flatDiscount || ""}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            "flatDiscount",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="p-1 w-16 rounded-md border border-gray-300"
                        placeholder=""
                        onWheel={(e) => e.preventDefault()}
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                    </td>
                  )}
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.amount || ""}
                      className="p-1 w-24 bg-gray-50 rounded-md border border-gray-300"
                      readOnly
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      className="p-1 text-red-500 rounded-md hover:text-red-700"
                      onClick={() => {
                        setQuotationData((prev) => {
                          const newItems = prev.items.filter(
                            (i) => i.id !== item.id
                          );
                          if (newItems.length === 0) {
                            return prev;
                          }

                          const subtotal = newItems.reduce(
                            (sum, current) => sum + Number(current.amount || 0),
                            0
                          );
                          const totalFlatDiscount = newItems.reduce(
                            (sum, current) =>
                              sum + Number(current.flatDiscount || 0),
                            0
                          );

                          let cgstAmount = 0;
                          let sgstAmount = 0;
                          let igstAmount = 0;

                          newItems.forEach((current) => {
                            const amount = Number(current.amount || 0);
                            let itemGST = Number(current.gst || 0);

                            if (amount <= 0 || itemGST <= 0) {
                              return;
                            }

                            if (
                              String(current.gst).toUpperCase().includes("IGST")
                            ) {
                              itemGST = itemGST / 2;
                            }

                            if (prev.isIGST) {
                              igstAmount += (amount * itemGST) / 100;
                            } else {
                              const halfGST = itemGST / 2;
                              const contribution = (amount * halfGST) / 100;
                              cgstAmount += contribution;
                              sgstAmount += contribution;
                            }
                          });

                          const roundedSubtotal = Number(subtotal.toFixed(2));
                          cgstAmount = Number(cgstAmount.toFixed(2));
                          sgstAmount = Number(sgstAmount.toFixed(2));
                          igstAmount = Number(igstAmount.toFixed(2));

                          const total = Math.max(
                            0,
                            Number(
                              (
                                roundedSubtotal +
                                cgstAmount +
                                sgstAmount +
                                igstAmount
                              ).toFixed(2)
                            )
                          );

                          const cgstRate =
                            !prev.isIGST && roundedSubtotal > 0
                              ? Number(
                                  (
                                    (cgstAmount / roundedSubtotal) *
                                    100
                                  ).toFixed(2)
                                )
                              : 0;
                          const sgstRate =
                            !prev.isIGST && roundedSubtotal > 0
                              ? Number(
                                  (
                                    (sgstAmount / roundedSubtotal) *
                                    100
                                  ).toFixed(2)
                                )
                              : 0;
                          const igstRate =
                            prev.isIGST && roundedSubtotal > 0
                              ? Number(
                                  (
                                    (igstAmount / roundedSubtotal) *
                                    100
                                  ).toFixed(2)
                                )
                              : 0;

                          return {
                            ...prev,
                            items: newItems,
                            totalFlatDiscount,
                            subtotal: roundedSubtotal,
                            cgstAmount,
                            sgstAmount,
                            igstAmount,
                            total,
                            cgstRate: prev.isIGST ? 0 : cgstRate,
                            sgstRate: prev.isIGST ? 0 : sgstRate,
                            igstRate: prev.isIGST ? igstRate : 0,
                          };
                        });
                      }}
                      disabled={quotationData.items.length <= 1 || isLoading}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={calculateColSpan()}
                  className="px-4 py-2 font-medium text-right"
                >
                  Subtotal:
                </td>
                <td className="p-2 border">
                  ₹
                  {typeof quotationData.subtotal === "number"
                    ? quotationData.subtotal.toFixed(2)
                    : "0.00"}
                </td>
                <td></td>
              </tr>
              {!hideTotalFlatDisc && (
                <tr>
                  <td
                    colSpan={calculateColSpan()}
                    className="px-4 py-2 font-medium text-right"
                  >
                    Total Flat Discount:
                  </td>
                  <td className="p-2">
                    ₹
                    {typeof quotationData.totalFlatDiscount === "number"
                      ? quotationData.totalFlatDiscount.toFixed(2)
                      : "0.00"}
                  </td>
                  <td></td>
                </tr>
              )}
              <tr className="border">
                <td
                  colSpan={calculateColSpan()}
                  className="px-4 py-2 font-medium text-right"
                >
                  Taxable Amount:
                </td>
                <td className="px-4 py-2">₹{taxableAmount.toFixed(2)}</td>
                <td></td>
              </tr>
              {quotationData.isIGST ? (
                <>
                  {Object.entries(quotationData.igstBreakdown || {}).map(
                    ([rate, value]) => (
                      <tr className="border" key={`igst-${rate}`}>
                        <td
                          colSpan={calculateColSpan()}
                          className="px-4 py-2 font-medium text-right"
                        >
                          IGST ({Number(rate)}%):
                        </td>
                        <td className="px-4 py-2">
                          ₹{Number(value).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )
                  )}
                  <tr className="border">
                    <td
                      colSpan={calculateColSpan()}
                      className="px-4 py-2 font-medium text-right"
                    >
                      IGST Total:
                    </td>
                    <td className="px-4 py-2">
                      ₹{(quotationData.igstAmount || 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </>
              ) : (
                <>
                  {Object.entries(quotationData.cgstBreakdown || {}).map(
                    ([rate, value]) => (
                      <tr className="border" key={`cgst-${rate}`}>
                        <td
                          colSpan={calculateColSpan()}
                          className="px-4 py-2 font-medium text-right"
                        >
                          CGST ({Number(rate)}%):
                        </td>
                        <td className="px-4 py-2">
                          ₹{Number(value).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )
                  )}
                  <tr className="border">
                    <td
                      colSpan={calculateColSpan()}
                      className="px-4 py-2 font-medium text-right"
                    >
                      CGST Total:
                    </td>
                    <td className="px-4 py-2">
                      ₹{(quotationData.cgstAmount || 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                  {Object.entries(quotationData.sgstBreakdown || {}).map(
                    ([rate, value]) => (
                      <tr className="border" key={`sgst-${rate}`}>
                        <td
                          colSpan={calculateColSpan()}
                          className="px-4 py-2 font-medium text-right"
                        >
                          SGST ({Number(rate)}%):
                        </td>
                        <td className="px-4 py-2">
                          ₹{Number(value).toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    )
                  )}
                  <tr className="border">
                    <td
                      colSpan={calculateColSpan()}
                      className="px-4 py-2 font-medium text-right"
                    >
                      SGST Total:
                    </td>
                    <td className="px-4 py-2">
                      ₹{(quotationData.sgstAmount || 0).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </>
              )}
              {!hideSpecialDiscount && (
                <tr>
                  <td
                    colSpan={calculateColSpan()}
                    className="px-4 py-2 font-medium text-right"
                  >
                    Special Discount:
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*\.?[0-9]*"
                      value={specialDiscount || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSpecialDiscount(value);
                        handleSpecialDiscountChange(value);
                      }}
                      className="p-1 w-24 rounded-md border border-gray-300"
                      onWheel={(e) => e.preventDefault()}
                      min="0"
                      placeholder=""
                      disabled={isLoading}
                    />
                  </td>
                </tr>
              )}
              {!hideSpecialDiscount && (
                <tr>
                  <td
                    colSpan={calculateColSpan()}
                    className="px-4 py-2 font-medium text-right"
                  >
                    Total Discount:
                  </td>
                  <td className="px-4 py-2">
                    ₹
                    {(() => {
                      const discountFromPercentage = quotationData.items.reduce(
                        (sum, item) => {
                          const itemTotal = item.qty * item.rate;
                          return sum + itemTotal * (item.discount / 100);
                        },
                        0
                      );
                      const totalDiscount =
                        discountFromPercentage +
                        quotationData.totalFlatDiscount +
                        (Number(specialDiscount) || 0);
                      return totalDiscount.toFixed(2);
                    })()}
                  </td>
                  <td></td>
                </tr>
              )}

              <tr className="font-bold">
                <td
                  colSpan={calculateColSpan()}
                  className="px-4 py-2 text-right"
                >
                  Grand Total:
                </td>
                <td className="px-4 py-2">
                  ₹
                  {(() => {
                    // Subtotal already has flat discounts applied (it's sum of item amounts)
                    // Taxes are already calculated on the correct taxable amount
                    const totalTaxAmount =
                      quotationData.cgstAmount +
                      quotationData.sgstAmount +
                      quotationData.igstAmount;
                    
                    // Grand Total = Subtotal + Taxes - Special Discount
                    const grandTotal =
                      quotationData.subtotal +
                      totalTaxAmount -
                      (Number(specialDiscount) || 0);

                    return Math.max(0, grandTotal).toFixed(2);
                  })()}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;