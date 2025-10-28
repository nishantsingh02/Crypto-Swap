import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../tokenList.json";
import axios from "axios"

function Swap() {
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState();
  const [tokenTwoAmount, setTokenTwoAmount] = useState();
  const [tokenOne, setTokenOne] = useState(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1); // are tokenOne and tokenTwo
  const [prices, setPrices] = useState(null);

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  // this is the setting componet
  function settings() {
    return (
      <>
        <div>Slippage Tolerance</div>
        <div>
          <Radio.Group value={slippage} onChange={handleSlippageChange}>
            <Radio.Button value={0.5}>0.5%</Radio.Button>
            <Radio.Button value={2.5}>2.5%</Radio.Button>
            <Radio.Button value={5}>5.0%</Radio.Button>
          </Radio.Group>
        </div>
      </>
    );
  }

  // this is the function to handle the amount Change
  function changeAmount(e) {
    setTokenOneAmount(e.target.value);
    // tokenTwo amount is totally depands upon tokenOne Amount
    if(e.target.value && prices) {
      setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
    } else {
      setTokenTwoAmount(null);
    }
  }

  // this function is for swapping the token side
  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  //this function tells that which model to open
  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  // this function change the token
  function modifyToken(idx) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const selectedToken = tokenList[idx];

    if (changeToken === 1) {
      // prevent selecting same token by user
      if (selectedToken.ticker === tokenTwo.ticker) {
        message.error("You cannot select the same token for both sides!");
        return;
      }
      setTokenOne(tokenList[idx]);
      fetchPrices(tokenList[idx].address, tokenTwo.address)
    } else {
      if (selectedToken.ticker === tokenOne.ticker) {
        message.error("You cannot select the same token for both sides!");
        return;
      }
      setTokenTwo(tokenList[idx]);
      fetchPrices(tokenOne.address, tokenList[idx].address)
    }
    setIsOpen(false);
  }

  async function fetchPrices(one, two) {

    const res = await axios.get(`https://crypto-swap-backend.vercel.app/tokenPrice`,{
      params: {addressOne: one, addressTwo: two}
    })

    console.log(res.data.ratio)
    setPrices(res.data)
  }

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address)
  }, [])

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a Token"
      >
        <div className="modalContent">
          {tokenList.map((token, idx) => {
            return (
              <div
                className="tokenChoice"
                key={idx}
                onClick={() => modifyToken(idx)}
              >
                <img src={token.img} alt={token.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{token.name}</div>
                  <div className="tokenTicker">{token.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            title="Setting"
            content={settings}
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            type="number"
            className=""
            placeholder="0.00"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0.00" value={tokenTwoAmount} disabled />

          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>

          {/* token logo logic */}
          <div
            className="assetOne"
            onClick={() => {
              openModal(1);
            }}
          >
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          {/* openModal(1) meaning “I want to change token one. */}
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" disabled={!tokenOneAmount}>
            Swap
        </div>
      </div>
    </>
  );
}

export default Swap;
